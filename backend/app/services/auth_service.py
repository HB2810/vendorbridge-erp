"""
Auth service layer containing signup, authentication, and database logic.
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import UserSignup, UserLogin
from app.utils.security import hash_password, verify_password


def signup_user(db: Session, data: UserSignup) -> User:
    """Register a new user with unique email validation and password hashing."""
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered.",
        )

    # Hash the password
    hashed = hash_password(data.password)

    # Create the user
    new_user = User(
        name=data.name,
        email=data.email,
        password_hash=hashed,
        role=data.role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def authenticate_user(db: Session, data: UserLogin) -> User | None:
    """Authenticate a user by email and password. Returns the User model or None."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        return None

    if not verify_password(data.password, user.password_hash):
        return None

    return user
