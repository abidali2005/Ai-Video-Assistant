from fastapi import APIRouter
from app.services.chat_service import get_chat, clear_chat
from app.dependencies import get_current_user
from app.modals import User
from fastapi import Depends
from app.services.ownership_service import verify_owner
from app.database import get_db
from sqlalchemy.orm import Session
router = APIRouter(
    prefix="/history",
    tags=["History"]
)


@router.get("/{video_id}")
def history(video_id: str ,db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_owner(
        db,
    video_id,
    current_user
       )
 

    return get_chat(video_id)


@router.delete("/{video_id}" )
def delete_history(video_id: str ,db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    verify_owner(
        db,
    video_id,
    current_user
       )


    clear_chat(video_id)

    return {
        "message": "History cleared"
    }