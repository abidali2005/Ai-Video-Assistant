from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import uuid

from app.database import get_db
from app.dependencies import get_current_user
from app.modals import User
from app.models.request import VideoRequest
from app.services.status_service import save_status
from app.services.upload_service import start_processing
from app.services.video_service import create_video
router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)



@router.post("/")
def upload_video(
    request: VideoRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    video_id = str(uuid.uuid4())

    # Create database record
    create_video(
        db=db,
        video_id=video_id,
        title=request.source,   # or another title if you have one
        owner_id=current_user.id
    )

    save_status(video_id, "queued")

    start_processing(
        request.source,
        video_id,
        current_user.id,
        current_user.email
    )

    return {
        "video_id": video_id,
        "status": "queued"
    }