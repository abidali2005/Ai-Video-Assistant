from fastapi import APIRouter, HTTPException

from app.services.status_service import get_status
from app.dependencies import get_current_user
from app.modals import User
from app.services.ownership_service import verify_owner
from fastapi import Depends
from app.database import get_db
from sqlalchemy.orm import Session
router = APIRouter(
    prefix="/status",
    tags=["Status"]
)


@router.get("/{video_id}")
def status(video_id: str ,db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    result = get_status(video_id)
    verify_owner(
        db,
    video_id,
    current_user
       )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Video not found"
        )

    return result