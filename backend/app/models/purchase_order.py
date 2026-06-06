"""
PurchaseOrder model — binding contract issued to vendor after quotation approval.
"""

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base
from app.models.base import TimestampMixin
from app.models.enums import PurchaseOrderStatus

if TYPE_CHECKING:
    from app.models.quotation import Quotation
    from app.models.vendor import Vendor
    from app.models.user import User
    from app.models.invoice import Invoice
    from app.models.approval import Approval


class PurchaseOrder(Base, TimestampMixin):
    __tablename__ = "purchase_orders"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    po_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    quotation_id: Mapped[int] = mapped_column(
        ForeignKey("quotations.id"), nullable=False, index=True
    )
    vendor_id: Mapped[int] = mapped_column(
        ForeignKey("vendors.id"), nullable=False, index=True
    )
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False
    )
    status: Mapped[PurchaseOrderStatus] = mapped_column(
        default=PurchaseOrderStatus.DRAFT, index=True
    )
    issued_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    issued_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    delivery_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    shipping_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    payment_terms: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # ── Relationships ─────────────────────────────────────────
    quotation: Mapped["Quotation"] = relationship(back_populates="purchase_orders")
    vendor: Mapped["Vendor"] = relationship(back_populates="purchase_orders")
    issuer: Mapped["User"] = relationship(
        back_populates="issued_purchase_orders", foreign_keys=[issued_by]
    )
    invoices: Mapped[list["Invoice"]] = relationship(
        back_populates="purchase_order", cascade="all, delete-orphan"
    )
    approvals: Mapped[list["Approval"]] = relationship(
        back_populates="purchase_order", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<PurchaseOrder id={self.id} number={self.po_number!r} status={self.status.value!r} amount={self.total_amount}>"
