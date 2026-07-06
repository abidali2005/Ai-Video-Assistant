from sqlalchemy.orm import Session

from app.modals import Video


def create_video(
    db: Session,
    video_id: str,
    title: str,
    owner_id: int
):

    video = Video(
        video_id=video_id,
        title=title,
        owner_id=owner_id
    )

    db.add(video)
    db.commit()
    db.refresh(video)

    return video
def get_video(db: Session, video_id: str):
    return db.query(Video).filter(
        Video.video_id == video_id
    ).first()

def get_user_videos(db: Session, owner_id: int):
    return db.query(Video).filter(
        Video.owner_id == owner_id
    ).all()
def delete_video(db: Session, video_id: str):

    video = get_video(db, video_id)

    if video:
        db.delete(video)
        db.commit()