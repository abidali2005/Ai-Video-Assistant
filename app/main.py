import asyncio
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.env_utils import env
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

FRONTEND_URL = env("FRONTEND_URL", "http://localhost:5173")
ALLOWED_ORIGINS = list(dict.fromkeys([
    "http://localhost:5173",
    FRONTEND_URL,
]))


@asynccontextmanager
async def lifespan(app: FastAPI):
    last_error = None
    for attempt in range(10):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except Exception as exc:
            last_error = exc
            print(f"Database init attempt {attempt + 1} failed: {exc}")
            await asyncio.sleep(3)
    else:
        raise RuntimeError(f"Could not initialize database: {last_error}") from last_error

    yield


app = FastAPI(
    title="AI Video Assistant API",
    version="1.0.0",
    lifespan=lifespan,
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