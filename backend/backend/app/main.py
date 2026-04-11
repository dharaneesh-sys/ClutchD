import json
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from uuid import UUID

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import select

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.limiter import limiter as app_limiter
from app.core.security import decode_token
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.ws.manager import manager, push_location_update

logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.upload_dir).resolve()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.state.limiter = app_limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)

static_dir = Path(settings.upload_dir)
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=str(static_dir)), name="static_uploads")


@app.get("/health")
async def health():
    return {"status": "ok"}


async def _authenticate_ws(token: str | None) -> User | None:
    """Shared WebSocket authentication helper. Returns User or None."""
    if not token:
        return None
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        return None
    try:
        uid = UUID(payload["sub"])
    except (ValueError, TypeError):
        return None
    async with AsyncSessionLocal() as db:
        r = await db.execute(select(User).where(User.id == uid, User.is_active.is_(True)))
        return r.scalar_one_or_none()


@app.websocket("/ws")
async def websocket_user(websocket: WebSocket, token: str | None = None):
    user = await _authenticate_ws(token)
    if not user:
        await websocket.close(code=4401)
        return

    await manager.connect_user(str(user.id), websocket)
    try:
        while True:
            raw = await websocket.receive_text()

            # Wrap ALL message processing in try/except so a single bad
            # message never kills the WebSocket loop.
            try:
                msg = json.loads(raw)
            except (json.JSONDecodeError, TypeError):
                continue

            if not isinstance(msg, dict):
                continue

            if msg.get("type") == "MECHANIC_LOCATION" and user.role == "mechanic":
                raw_lat, raw_lon = msg.get("lat"), msg.get("lon")
                if raw_lat is None or raw_lon is None:
                    continue

                # Validate coordinates are real numbers within physical bounds
                try:
                    lat = float(raw_lat)
                    lon = float(raw_lon)
                except (ValueError, TypeError):
                    continue

                if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                    continue

                from app.models.job import Job
                from app.models.mechanic import Mechanic

                try:
                    async with AsyncSessionLocal() as db:
                        mr = await db.execute(select(Mechanic).where(Mechanic.user_id == user.id))
                        mech = mr.scalar_one_or_none()
                        if not mech:
                            continue
                        mech.lat = lat
                        mech.lon = lon
                        await db.commit()
                        jr = await db.execute(
                            select(Job).where(
                                Job.assigned_mechanic_id == mech.id,
                                Job.status.in_(("assigned", "en_route", "in_progress")),
                            )
                        )
                        for job in jr.scalars().all():
                            await push_location_update(str(job.user_id), str(job.id), [lat, lon])
                except Exception:
                    logger.exception("Error processing MECHANIC_LOCATION update")
                    continue

    except WebSocketDisconnect:
        pass
    except Exception:
        # Catch any unexpected error so the server doesn't log an unhandled exception
        logger.exception("Unexpected WebSocket error for user %s", user.id)
    finally:
        manager.disconnect_user(str(user.id), websocket)


@app.websocket("/ws/tracking/{job_id}")
async def websocket_tracking(websocket: WebSocket, job_id: str, token: str | None = None):
    user = await _authenticate_ws(token)
    if not user:
        await websocket.close(code=4401)
        return

    try:
        jid = UUID(job_id)
    except (ValueError, TypeError):
        await websocket.close(code=4400)
        return

    from app.services.job_service import get_job_for_user

    async with AsyncSessionLocal() as db:
        job = await get_job_for_user(db, jid, user)
    if not job:
        await websocket.close(code=4403)
        return

    await manager.connect_job(job_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("Unexpected WebSocket tracking error for job %s", job_id)
    finally:
        manager.disconnect_job(job_id, websocket)
