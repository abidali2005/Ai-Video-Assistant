from sqlalchemy import Column , Integer , String , ForeignKey , DateTime
from sqlalchemy.orm import relationship

from app.database import Base
from app.database import Base
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer , primary_key=True)
    username = Column(String , unique=True)
    email =  Column(String , unique=True)
    password = Column(String)
    videos = relationship(
    "Video",
    back_populates="owner",
    cascade="all, delete"
)
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)



class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)

    video_id = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    title = Column(String)

    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    owner = relationship("User" ,
                         back_populates='videos')