import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.videos import router as videos_router
from app.api.upload import router as upload_router
from app.api.chat import router as chat_router
from app.api.health import router as health_router
from app.api.status import router as status_router
from app.api.upload_file import router as upload_file_router
from app.api.history import router as history_router
from app.database import Base
from app.database import engine
from app.api.auth import router as auth_router

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ALLOWED_ORIGINS = list(dict.fromkeys([
    "http://localhost:5173",
    FRONTEND_URL,
]))

Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="AI Video Assistant API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(chat_router)
app.include_router(health_router)
app.include_router(videos_router)
app.include_router(status_router)
app.include_router(upload_file_router)
app.include_router(history_router)
app.include_router(auth_router)