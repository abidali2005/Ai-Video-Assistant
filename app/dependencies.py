from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import get_db
from app.modals import User
from app.security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


print("SECURITY SECRET_KEY =", SECRET_KEY)
print("SECURITY ALGORITHM =", ALGORITHM)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    print("=" * 50)
    print("TOKEN:", token)

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        print("PAYLOAD:", payload)

        user_id = payload.get("sub")
        print("USER ID:", user_id)

        if user_id is None:
            print("SUB IS NONE")
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials",
            )

    except JWTError as e:
        print("JWT ERROR:", e)
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()

    print("USER:", user)

    if user is None:
        print("USER NOT FOUND")
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
        )

    return user