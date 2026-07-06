from fastapi import APIRouter
from sqlalchemy import text

router = APIRouter(tags=["Health"])


@router.get("/")
def root():
    return {
        "message": "AI Video Assistant Backend Running"
    }


@router.get("/health")
def health():
    db_status = "unknown"
    try:
        from app.database import get_engine
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        db_status = f"error: {exc}"

    return {
        "status": "healthy",
        "database": db_status,
    }