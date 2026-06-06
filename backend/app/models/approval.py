"""
Approval model — workflow steps for approving Quotations.
"""

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base
from app.models.base import TimestampMixin
from app.models.enums import ApprovalStatus

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.quotation import Quotation
    from app.models.purchase_order import PurchaseOrder


class Approval(Base, TimestampMixin):
    __tablename__ = "approvals"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    quotation_id: Mapped[int] = mapped_column(
        ForeignKey("quotations.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    approved_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    status: Mapped[ApprovalStatus] = mapped_column(
        default=ApprovalStatus.PENDING, index=True
    )
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=True,
    )

    # ── Relationships ─────────────────────────────────────────
    quotation: Mapped["Quotation"] = relationship(back_populates="approval")
    approver: Mapped["User"] = relationship(back_populates="approvals", foreign_keys=[approved_by])
    purchase_order: Mapped["PurchaseOrder | None"] = relationship(
        back_populates="approval", secondary="quotations", viewonly=True, uselist=False
    )

    def __repr__(self) -> str:
        return f"<Approval id={self.id} quotation={self.quotation_id} status={self.status.value!r}>"
