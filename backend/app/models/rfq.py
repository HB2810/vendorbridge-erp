"""
RFQ (Request for Quotation) model — procurement event header.
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base
from app.models.base import TimestampMixin
from app.models.enums import RFQStatus

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.rfq_item import RFQItem
    from app.models.rfq_vendor import RFQVendor
    from app.models.quotation import Quotation


class RFQ(Base, TimestampMixin):
    __tablename__ = "rfqs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    rfq_number: Mapped[str] = mapped_column(
        String(30), unique=True, nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    deadline: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    status: Mapped[RFQStatus] = mapped_column(
        default=RFQStatus.DRAFT, index=True
    )
    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )

    # ── Relationships ─────────────────────────────────────────
    creator: Mapped["User"] = relationship(
        back_populates="rfqs_created", foreign_keys=[created_by]
    )
    items: Mapped[list["RFQItem"]] = relationship(
        back_populates="rfq", cascade="all, delete-orphan"
    )
    vendor_assignments: Mapped[list["RFQVendor"]] = relationship(
        back_populates="rfq", cascade="all, delete-orphan"
    )
    quotations: Mapped[list["Quotation"]] = relationship(
        back_populates="rfq", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<RFQ id={self.id} number={self.rfq_number!r} status={self.status.value!r}>"