"""
RFQ–Vendor Assignment model — many-to-many junction table.

Tracks which vendors are invited to bid on which RFQs and their
response status.
"""

from app.models.rfq import RFQ
from app.models.vendor import Vendor
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class RFQVendorAssignment(Base):
    __tablename__ = "rfq_vendor_assignments"

    __table_args__ = (
        UniqueConstraint("rfq_id", "vendor_id", name="uq_rfq_vendor"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    rfq_id: Mapped[int] = mapped_column(
        ForeignKey("rfqs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vendor_id: Mapped[int] = mapped_column(
        ForeignKey("vendors.id"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="invited"
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
    rfq: Mapped["RFQ"] = relationship(  # noqa: F821
        back_populates="vendor_assignments"
    )
    vendor: Mapped["Vendor"] = relationship(  # noqa: F821
        back_populates="rfq_assignments"
    )

    def __repr__(self) -> str:
        return f"<RFQVendorAssignment rfq={self.rfq_id} vendor={self.vendor_id} status={self.status!r}>"
