import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.api.deps import CurrentUser
from app.core.config import get_settings

router = APIRouter(prefix="/uploads", tags=["uploads"])

# 1MB chunks for streaming uploads
_CHUNK_SIZE = 1024 * 1024


@router.post("")
async def upload_file(user: CurrentUser, file: UploadFile = File(...)):
    settings = get_settings()
    if not file.filename:
        raise HTTPException(status_code=422, detail="No filename")

    # Sanitize and validate extension
    ext = Path(file.filename).suffix.lower()[:10] or ".bin"
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm"}
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    max_b = settings.max_upload_mb * 1024 * 1024
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    path = upload_dir / name

    # Stream the file in chunks to avoid loading the entire file into RAM.
    # This prevents OOM crashes from oversized uploads.
    total_written = 0
    try:
        with open(path, "wb") as f:
            while True:
                chunk = await file.read(_CHUNK_SIZE)
                if not chunk:
                    break
                total_written += len(chunk)
                if total_written > max_b:
                    # Abort immediately — do NOT continue reading the rest
                    break
                f.write(chunk)
    except Exception:
        # Clean up partial file on any I/O error
        if path.exists():
            path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="File upload failed")

    if total_written > max_b:
        # Clean up the oversized partial file
        if path.exists():
            path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed: {settings.max_upload_mb}MB",
        )

    if total_written == 0:
        if path.exists():
            path.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail="Empty file")

    return {"url": f"/static/uploads/{name}", "filename": name}
