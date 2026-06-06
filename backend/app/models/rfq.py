
"""
RFQ (Request for Quotation) model — procurement event header.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base
from app.models.base import TimestampMixin


class RFQ(Base, TimestampMixin):
    __tablename__ = "rfqs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    rfq_number: Mapped[str] = mapped_column(
        String(30), unique=True, nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft", index=True
    )
    submission_deadline: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )

    # ── Relationships ─────────────────────────────────────────
    creator: Mapped["User"] = relationship(  # noqa: F821
        back_populates="rfqs", foreign_keys=[created_by]
    )
    items: Mapped[list["RFQItem"]] = relationship(  # noqa: F821
        back_populates="rfq", cascade="all, delete-orphan"
    )
    vendor_assignments: Mapped[list["RFQVendorAssignment"]] = relationship(  # noqa: F821
        back_populates="rfq", cascade="all, delete-orphan"
    )
    quotations: Mapped[list["Quotation"]] = relationship(  # noqa: F821
        back_populates="rfq"
    )

    def __repr__(self) -> str:
        return f"<RFQ id={self.id} number={self.rfq_number!r} status={self.status!r}>"