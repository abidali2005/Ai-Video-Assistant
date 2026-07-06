from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/")
def root():
    return {
        "message": "AI Video Assistant Backend Running"
    }


@router.get("/health")
def health():
    return {
        "status": "healthy"
    }