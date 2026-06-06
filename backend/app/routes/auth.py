"""
Authentication routes for signup, login, and user profile.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import UserSignup, UserLogin, Token, UserResponse
from app.services.auth_service import signup_user, authenticate_user
from app.utils.security import create_access_token
from app.routes.roles import get_current_user

router = APIRouter()


@router.post(
    "/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def signup(data: UserSignup, db: Session = Depends(get_db)):
    """Register a new system user."""
    user = signup_user(db, data)
    return user


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate credentials and generate a JWT access token."""
    user = authenticate_user(db, data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Encode user email (sub) and role in the token payload
    token_payload = {"sub": user.email, "role": user.role.value}
    token = create_access_token(data=token_payload)

    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve the currently authenticated user profile."""
    return current_user
