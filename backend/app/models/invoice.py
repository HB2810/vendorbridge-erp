"""
Invoice model — vendor requests for payment referencing a Purchase Order.
"""

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base
from app.models.base import TimestampMixin
from app.models.enums import InvoiceStatus

if TYPE_CHECKING:
    from app.models.purchase_order import PurchaseOrder
    from app.models.vendor import Vendor
    from app.models.user import User


class Invoice(Base, TimestampMixin):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    invoice_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    purchase_order_id: Mapped[int] = mapped_column(
        ForeignKey("purchase_orders.id"), nullable=False, index=True
    )
    vendor_id: Mapped[int] = mapped_column(
        ForeignKey("vendors.id"), nullable=False, index=True
    )
    amount_due: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False
    )
    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, default=Decimal("0.00")
    )
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False
    )
    status: Mapped[InvoiceStatus] = mapped_column(
        default=InvoiceStatus.DRAFT, index=True
    )
    issue_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    due_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    paid_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    submitted_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )

    # ── Relationships ─────────────────────────────────────────
    purchase_order: Mapped["PurchaseOrder"] = relationship(back_populates="invoices")
    vendor: Mapped["Vendor"] = relationship(back_populates="invoices")
    submitter: Mapped["User"] = relationship(
        back_populates="submitted_invoices", foreign_keys=[submitted_by]
    )

    def __repr__(self) -> str:
        return f"<Invoice id={self.id} number={self.invoice_number!r} status={self.status.value!r} total={self.total_amount}>"
