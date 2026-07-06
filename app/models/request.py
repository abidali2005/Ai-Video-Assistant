from pydantic import BaseModel

class VideoRequest(BaseModel):
    source: str


class ChatRequest(BaseModel):
    video_id: str
    question: str