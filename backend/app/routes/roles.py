"""
Dependencies for JWT token validation and Role-Based Access Control (RBAC).
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.models.enums import UserRole
from app.utils.security import decode_access_token

# Setup OAuth2 scheme. Point tokenUrl to the login route.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """Dependency that extracts the JWT token, decodes it, and retrieves the User."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    email: str | None = payload.get("sub")
    if not email:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise credentials_exception

    return user


class RoleChecker:
    """Reusable dependency to enforce role constraints on route handlers."""

    def __init__(self, allowed_roles: list[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Requires one of roles: {[r.value for r in self.allowed_roles]}",
            )
        return current_user


def require_role(role: UserRole) -> RoleChecker:
    """Require a single specific role to access an endpoint."""
    return RoleChecker([role])


def require_any_role(*roles: UserRole) -> RoleChecker:
    """Require any of the listed roles to access an endpoint."""
    return RoleChecker(list(roles))
