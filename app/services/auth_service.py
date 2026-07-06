from sqlalchemy.orm import Session

from app.modals import User
from app.security import hash_password
from app.security import verify_password
from sqlalchemy.exc import IntegrityError
import secrets
from datetime import datetime, timedelta

from app.modals import User
from app.security import hash_password
from app.security import (
    verify_password,
    create_access_token
)

def create_user(db: Session, username: str, email: str, password: str):

    user = User(
        username=username,
        email=email,
        password=hash_password(password)
    )

    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Username or email already exists.")
    db.refresh(user)

    return user


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(
        User.email == email
    ).first()
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(
        User.username == username
    ).first()


def authenticate_user(db: Session, email: str, password: str):

    user = get_user_by_email(db, email)

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user

def login_user(
    db: Session,
    email: str,
    password: str
):
    user = authenticate_user(
        db,
        email,
        password
    )

    if not user:
        return None

    token = create_access_token(
        {
            "sub": str(user.id)
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

def forgot_password(db, email):

    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    token = secrets.token_urlsafe(32)

    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=30)

    db.commit()

    return token

def reset_password(db, token, new_password):

    user = db.query(User).filter(
        User.reset_token == token
    ).first()

    if not user:
        return False

    if user.reset_token_expiry < datetime.utcnow():
        return False

    user.password = hash_password(new_password)

    user.reset_token = None
    user.reset_token_expiry = None

    db.commit()

    return True