from fastapi import APIRouter
from app.models.request import ChatRequest
from app.services.chat_service import save_message
from app.dependencies import get_current_user
from app.modals import User
from fastapi import Depends 
from app.services.ownership_service import verify_owner
from app.database import get_db
from sqlalchemy.orm import Session
router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

@router.post("/")
def chat(request: ChatRequest , current_user: User = Depends(get_current_user) ,  db: Session = Depends(get_db) ):
    from core.rag_engine import load_rag, ask_question

    rag_chain = load_rag(request.video_id)
    

    answer = ask_question(
        rag_chain,
        request.question
    )

    save_message(
        request.video_id,
        "You",
        request.question
    )

    save_message(
        request.video_id,
        "Assistant",
        answer
    )
    verify_owner(
        db,
    request.video_id,
    current_user
)

    return {
        "video_id": request.video_id,
        "question": request.question,
        "answer": answer
    }