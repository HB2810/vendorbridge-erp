"""
User model — system users with role-based access.
"""

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base
from app.models.base import TimestampMixin
from app.models.enums import UserRole

if TYPE_CHECKING:
    from app.models.rfq import RFQ
    from app.models.approval import Approval
    from app.models.activity_log import ActivityLog


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        default=UserRole.VENDOR, index=True
    )

    # ── Relationships ─────────────────────────────────────────
    rfqs_created: Mapped[list["RFQ"]] = relationship(
        back_populates="creator", foreign_keys="RFQ.created_by"
    )
    approvals: Mapped[list["Approval"]] = relationship(
        back_populates="approver", foreign_keys="Approval.approved_by"
    )
    activity_logs: Mapped[list["ActivityLog"]] = relationship(
        back_populates="user"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role.value!r}>"
