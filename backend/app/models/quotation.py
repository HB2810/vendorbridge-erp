"""
Quotation model — vendor bids/proposals submitted in response to an RFQ.
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base
from app.models.base import TimestampMixin
from app.models.enums import QuotationStatus

if TYPE_CHECKING:
    from app.models.rfq import RFQ
    from app.models.vendor import Vendor
    from app.models.approval import Approval
    from app.models.purchase_order import PurchaseOrder


class Quotation(Base, TimestampMixin):
    __tablename__ = "quotations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    rfq_id: Mapped[int] = mapped_column(
        ForeignKey("rfqs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vendor_id: Mapped[int] = mapped_column(
        ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False, index=True
    )
    subtotal: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    tax_percent: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), nullable=False, default=Decimal("0.00")
    )
    grand_total: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    delivery_days: Mapped[int] = mapped_column(nullable=False)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[QuotationStatus] = mapped_column(
        default=QuotationStatus.DRAFT, index=True
    )
    submitted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=True,
    )

    # ── Relationships ─────────────────────────────────────────
    rfq: Mapped["RFQ"] = relationship(back_populates="quotations")
    vendor: Mapped["Vendor"] = relationship(back_populates="quotations")
    approval: Mapped["Approval | None"] = relationship(
        back_populates="quotation", uselist=False, cascade="all, delete-orphan"
    )
    purchase_order: Mapped["PurchaseOrder | None"] = relationship(
        back_populates="quotation", uselist=False
    )

    def __repr__(self) -> str:
        return f"<Quotation id={self.id} status={self.status.value!r} total={self.grand_total}>"
