from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import uuid

from app.database import get_db
from app.dependencies import get_current_user
from app.modals import User

from app.services.status_service import save_status
from app.services.upload_service import start_processing
from app.services.video_service import create_video

router = APIRouter(
    prefix="/upload-file",
    tags=["Upload File"]
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    video_id = str(uuid.uuid4())
    create_video(
    db=db,
    video_id=video_id,
    title=Path(file.filename).name,
    owner_id=current_user.id
)

    save_status(video_id, "queued")

    extension = Path(file.filename).suffix
    filename = f"{video_id}{extension}"
    file_path = UPLOAD_DIR / filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    start_processing(
        str(file_path),
        video_id,
        current_user.id,
        current_user.email
    )

    return {
        "video_id": video_id,
        "status": "queued"
    }