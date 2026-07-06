import os

from fastapi_mail import FastMail, MessageSchema, MessageType
from app.mail import conf

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


async def send_reset_email(email: str, token: str):

    link = f"{FRONTEND_URL}/reset-password?token={token}"

    html = f"""
    <h2>Password Reset</h2>

    <p>You requested to reset your password.</p>

    <p>
        <a href="{link}">
            Click here to reset your password
        </a>
    </p>

    <p>This link expires in 30 minutes.</p>
    """

    message = MessageSchema(
        subject="Reset Password",
        recipients=[email],
        body=html,
        subtype=MessageType.html,
    )

    fm = FastMail(conf)

    await fm.send_message(message)