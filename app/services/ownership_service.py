from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modals import Video


def verify_owner(
    db: Session,
    video_id: str,
    current_user
):

    video = db.query(Video).filter(
        Video.video_id == video_id
    ).first()

    if video is None:
        raise HTTPException(
            status_code=404,
            detail="Video not found."
        )

    if video.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission."
        )

    return video