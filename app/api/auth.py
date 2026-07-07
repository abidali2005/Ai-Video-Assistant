from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import RegisterRequest
from app.schemas import LoginRequest , TokenResponse
from app.schemas import UserResponse

from app.services.auth_service import create_user
from app.services.auth_service import get_user_by_email  , get_user_by_username
from app.services.auth_service import authenticate_user,login_user

from app.security import create_access_token
from typing import Annotated
from app.dependencies import get_current_user
from app.modals import User
from app.schemas import ForgotPasswordRequest, ResetPasswordRequest
from app.services.mail_service import send_reset_email
from app.services.auth_service import (
    forgot_password,
    reset_password
)

DbSession = Annotated[Session, Depends(get_db)]

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register" )
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing_email = get_user_by_email(db, request.email)
   


    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists."
        )
    existing_username = get_user_by_username(db, request.username)
    if existing_username:
        raise HTTPException(
            status_code=409,
            detail="Username already taken."
        )


    user = create_user(
        db,
        request.username,
        request.email,
        request.password
    )

    return {
        "message": "User registered successfully.",
        "user": UserResponse.model_validate(user),
    }


@router.post("/login" , response_model=TokenResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
   


    token = login_user(
        db,
        request.email,
        request.password
    )

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return token

@router.post("/forgot-password")
async def forgot_password_route(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    token = forgot_password(db, request.email)

    if token:
         await send_reset_email(request.email, token)
        

    return {
        "message": "If an account exists, a password reset link has been sent.",
          # Remove this in production
    }


@router.post("/reset-password")
def reset_password_route(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    success = reset_password(
        db,
        request.token,
        request.new_password
    )

    if not success:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired token."
        )

    return {
        "message": "Password reset successful."
    }
