"""
Vendor model — external suppliers and service providers.
"""

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base
from app.models.base import TimestampMixin
from app.models.enums import VendorStatus

if TYPE_CHECKING:
    from app.models.rfq_vendor import RFQVendor
    from app.models.quotation import Quotation
    from app.models.purchase_order import PurchaseOrder


class Vendor(Base, TimestampMixin):
    __tablename__ = "vendors"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    vendor_code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(
        String(100), nullable=True, index=True
    )
    gst_number: Mapped[str | None] = mapped_column(String(15), nullable=True)
    contact_person: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[VendorStatus] = mapped_column(
        default=VendorStatus.ACTIVE, index=True
    )
    rating: Mapped[Decimal | None] = mapped_column(
        Numeric(3, 2), nullable=True, default=Decimal("0.00")
    )

    # ── Relationships ─────────────────────────────────────────
    rfq_assignments: Mapped[list["RFQVendor"]] = relationship(
        back_populates="vendor", cascade="all, delete-orphan"
    )
    quotations: Mapped[list["Quotation"]] = relationship(
        back_populates="vendor", cascade="all, delete-orphan"
    )
    purchase_orders: Mapped[list["PurchaseOrder"]] = relationship(
        back_populates="vendor", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Vendor id={self.id} code={self.vendor_code!r} company={self.company_name!r} status={self.status.value!r}>"
