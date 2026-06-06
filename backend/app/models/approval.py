"""
Approval model — workflow steps for approving Quotations or Purchase Orders.
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Text
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
    approver_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    quotation_id: Mapped[int | None] = mapped_column(
        ForeignKey("quotations.id", ondelete="CASCADE"), nullable=True, index=True
    )
    purchase_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=True, index=True
    )
    status: Mapped[ApprovalStatus] = mapped_column(
        default=ApprovalStatus.PENDING, index=True
    )
    comments: Mapped[str | None] = mapped_column(Text, nullable=True)
    actioned_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ── Relationships ─────────────────────────────────────────
    approver: Mapped["User"] = relationship(back_populates="approvals")
    quotation: Mapped["Quotation | None"] = relationship(back_populates="approvals")
    purchase_order: Mapped["PurchaseOrder | None"] = relationship(back_populates="approvals")

    def __repr__(self) -> str:
        target = f"quotation={self.quotation_id}" if self.quotation_id else f"po={self.purchase_order_id}"
        return f"<Approval id={self.id} approver={self.approver_id} status={self.status.value!r} target={target}>"
