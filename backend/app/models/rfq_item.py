"""
RFQ Item model — individual line items within a Request for Quotation.
"""

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.rfq import RFQ


class RFQItem(Base, TimestampMixin):
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

    # ── Relationships ─────────────────────────────────────────
    rfq: Mapped["RFQ"] = relationship(back_populates="items")

    def __repr__(self) -> str:
        return f"<RFQItem id={self.id} name={self.item_name!r} qty={self.quantity}>"
