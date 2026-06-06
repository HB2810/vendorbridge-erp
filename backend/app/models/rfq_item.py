"""
RFQ Item model — individual line items within a Request for Quotation.
"""

from app.models.rfq import RFQ
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class RFQItem(Base):
    __tablename__ = "rfq_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    rfq_id: Mapped[int] = mapped_column(
        ForeignKey("rfqs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    unit: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pcs"
    )
    estimated_unit_price: Mapped[Decimal | None] = mapped_column(
        Numeric(14, 2), nullable=True
    )
    specifications: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────
    rfq: Mapped["RFQ"] = relationship(  # noqa: F821
        back_populates="items"
    )
    QuotationItem = None
    quotation_items: Mapped[list["QuotationItem"]] = relationship(  # noqa: F821
        back_populates="rfq_item"
    )

    def __repr__(self) -> str:
        return f"<RFQItem id={self.id} name={self.item_name!r} qty={self.quantity}>"
