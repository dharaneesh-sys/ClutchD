import secrets

import httpx
from fastapi import APIRouter, HTTPException, Request
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.core.limiter import limiter
from app.core.config import get_settings
from app.core.security import create_access_token, hash_password
from app.models.garage import Garage
from app.models.mechanic import Mechanic
from app.models.user import User
from app.schemas.auth import (
    CustomerRegister,
    GarageRegister,
    GoogleOAuthRequest,
    LoginRequest,
    MechanicRegister,
    MessageResponse,
    SignupPayload,
    TokenResponse,
)
from app.schemas.profile import MechanicProfileUpdate, GarageProfileUpdate
from app.services import auth_service
from app.services.auth_service import AuthError
from app.services.user_payload import user_to_frontend_dict

router = APIRouter(prefix="/auth", tags=["auth"])


def _auth_exc(e: AuthError) -> HTTPException:
    return HTTPException(status_code=e.code, detail=e.message)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("30/minute")
async def login_route(request: Request, body: LoginRequest, db: DbSession):
    try:
        token, user = await auth_service.login(db, body.email, body.password)
        return TokenResponse(token=token, user=user)
    except AuthError as e:
        raise _auth_exc(e) from e


@router.post("/signup", response_model=TokenResponse)
@limiter.limit("15/minute")
async def signup_route(request: Request, body: SignupPayload, db: DbSession):
    try:
        token, user = await auth_service.signup_from_payload(db, body)
        return TokenResponse(token=token, user=user)
    except AuthError as e:
        raise _auth_exc(e) from e
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e


@router.post("/register/customer", response_model=TokenResponse)
@limiter.limit("15/minute")
async def register_customer(request: Request, body: CustomerRegister, db: DbSession):
    try:
        token, user = await auth_service.register_customer(db, body)
        return TokenResponse(token=token, user=user)
    except AuthError as e:
        raise _auth_exc(e) from e


@router.post("/register/mechanic", response_model=TokenResponse)
@limiter.limit("15/minute")
async def register_mechanic(request: Request, body: MechanicRegister, db: DbSession):
    try:
        token, user = await auth_service.register_mechanic(db, body)
        return TokenResponse(token=token, user=user)
    except AuthError as e:
        raise _auth_exc(e) from e


@router.post("/register/garage", response_model=TokenResponse)
@limiter.limit("15/minute")
async def register_garage(request: Request, body: GarageRegister, db: DbSession):
    try:
        token, user = await auth_service.register_garage(db, body)
        return TokenResponse(token=token, user=user)
    except AuthError as e:
        raise _auth_exc(e) from e


@router.post("/logout", response_model=MessageResponse)
async def logout():
    return MessageResponse(message="ok")


@router.post("/oauth/google", response_model=TokenResponse)
@limiter.limit("20/minute")
async def oauth_google(request: Request, body: GoogleOAuthRequest, db: DbSession):
    settings = get_settings()
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": body.id_token},
                timeout=15.0,
            )
            if r.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google token")
            data = r.json()
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail="Authentication service unavailable. Please try again later.",
        ) from exc
    if settings.google_oauth_client_id and data.get("aud") != settings.google_oauth_client_id:
        raise HTTPException(status_code=401, detail="Token audience mismatch")
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email not present in token")

    res = await db.execute(select(User).where(User.email == email.lower()))
    user = res.scalar_one_or_none()
    if not user:
        user = User(
            email=email.lower(),
            password_hash=hash_password(secrets.token_urlsafe(32)),
            role="customer",
        )
        db.add(user)
        await db.flush()
    token = create_access_token(str(user.id), {"role": user.role})
    payload = await user_to_frontend_dict(db, user)
    return TokenResponse(token=token, user=payload)


# ─── Maximum field lengths to prevent database overflow ────────────────────
_MAX_NAME_LEN = 200
_MAX_PHONE_LEN = 20
_MAX_LOCATION_LEN = 500
_MAX_HOURS_LEN = 100
_MAX_EXPERTISE_ITEMS = 20


def _sanitize_str(val: str | None, max_len: int) -> str | None:
    """Strip and truncate a string value to prevent oversized DB writes."""
    if val is None:
        return None
    return val.strip()[:max_len] or None


@router.patch("/me", response_model=TokenResponse)
async def update_profile(request: Request, db: DbSession, current_user: CurrentUser):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    if not isinstance(body, dict):
        raise HTTPException(status_code=400, detail="Request body must be a JSON object")

    if current_user.role == "mechanic":
        update_data = MechanicProfileUpdate(**body)
        r = await db.execute(select(Mechanic).where(Mechanic.user_id == current_user.id))
        mech = r.scalar_one_or_none()
        if not mech:
            raise HTTPException(status_code=404, detail="Mechanic profile not found")
        if update_data.name is not None:
            mech.full_name = _sanitize_str(update_data.name, _MAX_NAME_LEN)
        if update_data.phone is not None:
            mech.phone = _sanitize_str(update_data.phone, _MAX_PHONE_LEN)
        if update_data.location is not None:
            mech.location_address = _sanitize_str(update_data.location, _MAX_LOCATION_LEN)
        if update_data.expertise is not None:
            # Limit number of expertise items and sanitize each
            cleaned = [e.strip()[:64] for e in update_data.expertise[:_MAX_EXPERTISE_ITEMS] if e.strip()]
            mech.expertise = cleaned

    elif current_user.role == "garage":
        update_data = GarageProfileUpdate(**body)
        r = await db.execute(select(Garage).where(Garage.user_id == current_user.id))
        gar = r.scalar_one_or_none()
        if not gar:
            raise HTTPException(status_code=404, detail="Garage profile not found")
        if update_data.name is not None:
            gar.garage_name = _sanitize_str(update_data.name, _MAX_NAME_LEN)
        if update_data.phone is not None:
            gar.phone = _sanitize_str(update_data.phone, _MAX_PHONE_LEN)
        if update_data.location is not None:
            gar.location_address = _sanitize_str(update_data.location, _MAX_LOCATION_LEN)
        if update_data.operatingHours is not None:
            gar.operating_hours = _sanitize_str(update_data.operatingHours, _MAX_HOURS_LEN)
        if update_data.services is not None:
            cleaned = [s.strip()[:64] for s in update_data.services[:_MAX_EXPERTISE_ITEMS] if s.strip()]
            gar.services = cleaned
        if update_data.mechanicCount is not None:
            try:
                mc = int(update_data.mechanicCount)
                gar.mechanic_count = max(0, min(mc, 9999))  # Clamp to sane range
            except (ValueError, TypeError):
                pass  # Ignore invalid mechanic count
    else:
        raise HTTPException(status_code=403, detail="Profile updates not supported for this role")

    await db.commit()

    # Refresh the user state from DB and return updated payload
    payload = await user_to_frontend_dict(db, current_user)

    # Preserve callers existing JWT token
    auth_header = request.headers.get("Authorization", "")
    token = ""
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    return TokenResponse(token=token, user=payload)
