"""
RFQ–Vendor Junction model — tracks which vendors are invited to bid on which RFQs.
"""

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.rfq import RFQ
    from app.models.vendor import Vendor


class RFQVendor(Base):
    __tablename__ = "rfq_vendors"

    __table_args__ = (
        UniqueConstraint("rfq_id", "vendor_id", name="uq_rfq_vendor"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    rfq_id: Mapped[int] = mapped_column(
        ForeignKey("rfqs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vendor_id: Mapped[int] = mapped_column(
        ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="invited", index=True
    )
    invited_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    responded_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ── Relationships ─────────────────────────────────────────
    rfq: Mapped["RFQ"] = relationship(
        back_populates="vendor_assignments"
    )
    vendor: Mapped["Vendor"] = relationship(
        back_populates="rfq_assignments"
    )

    def __repr__(self) -> str:
        return f"<RFQVendor rfq={self.rfq_id} vendor={self.vendor_id} status={self.status!r}>"
