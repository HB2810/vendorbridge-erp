"""
Pydantic schemas for authentication and user payload validation.
"""

from datetime import datetime
from pydantic import BaseModel, Field

from app.models.enums import UserRole

# A simple, robust regex pattern for email validation that does not require email-validator
EMAIL_PATTERN = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"


class UserSignup(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str = Field(
        ..., min_length=8, description="Password must be at least 8 characters long"
    )
    role: UserRole = Field(default=UserRole.VENDOR)

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Jane Doe",
                "email": "jane@example.com",
                "password": "password123",
                "role": "VENDOR",
            }
        }
    }


class UserLogin(BaseModel):
    email: str = Field(..., pattern=EMAIL_PATTERN)
    password: str = Field(...)

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "jane@example.com",
                "password": "password123",
            }
        }
    }


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: str | None = None
    role: UserRole | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
