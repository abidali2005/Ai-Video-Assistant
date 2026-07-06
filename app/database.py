import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

from app.env_utils import resolve_database_url

load_dotenv()

Base = declarative_base()
_engine = None
_SessionLocal = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(resolve_database_url())
    return _engine


def get_session_local():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=get_engine(),
        )
    return _SessionLocal


def init_db():
    Base.metadata.create_all(bind=get_engine())


def get_db():
    db = get_session_local()()
    try:
        yield db
    finally:
        db.close()
