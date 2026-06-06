"""
ActivityLog model — system activity/audit logging.
"""

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    entity_id: Mapped[int | None] = mapped_column(nullable=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────
    user: Mapped["User"] = relationship(back_populates="activity_logs")

    def __repr__(self) -> str:
        return f"<ActivityLog id={self.id} user={self.user_id} action={self.action!r} entity={self.entity_type}:{self.entity_id}>"
