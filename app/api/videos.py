from fastapi import APIRouter
from fastapi import HTTPException
from app.services.metadata_services import list_metadata , get_metadata , delete_metadata
import shutil
from pathlib import Path
from app.dependencies import get_current_user
from app.modals import User
from fastapi import Depends
from app.services.ownership_service import verify_owner
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.video_service import get_user_videos

router = APIRouter(
    prefix="/videos",
    tags=["Videos"]
)

@router.get("/")
def get_videos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    videos = get_user_videos(
        db,
        current_user.id
    )

    result = []

    for video in videos:
        metadata = get_metadata(video.video_id)

        if metadata:
            result.append(metadata)

    return result
@router.get("/{video_id}")
def get_video(
    video_id: str,db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    video = get_metadata(video_id)

    if video is None:
        raise HTTPException(
            status_code=404,
            detail="Video not found"
        )

    verify_owner(db , video_id, current_user)

    return video

@router.delete("/{video_id}")
def delete_video(
    video_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_owner(db, video_id, current_user)

    from core.vector_store import delete_vector_store

    delete_metadata(video_id)

    delete_vector_store(video_id)

    vector_dir = Path("vector_db") / video_id
    if vector_dir.exists():
        shutil.rmtree(vector_dir, ignore_errors=True)

    return {"message": "Video deleted successfully"}