"""
PurchaseOrder model — binding contract issued to vendor after quotation approval.
"""

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base
from app.models.base import TimestampMixin
from app.models.enums import PurchaseOrderStatus

if TYPE_CHECKING:
    from app.models.quotation import Quotation
    from app.models.vendor import Vendor
    from app.models.approval import Approval
    from app.models.invoice import Invoice


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
    status: Mapped[PurchaseOrderStatus] = mapped_column(
        default=PurchaseOrderStatus.DRAFT, index=True
    )

    # ── Relationships ─────────────────────────────────────────
    quotation: Mapped["Quotation"] = relationship(back_populates="purchase_order")
    vendor: Mapped["Vendor"] = relationship(back_populates="purchase_orders")
    approval: Mapped["Approval | None"] = relationship(
        back_populates="purchase_order", secondary="quotations", viewonly=True, uselist=False
    )
    invoices: Mapped[list["Invoice"]] = relationship(
        back_populates="purchase_order", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<PurchaseOrder id={self.id} number={self.po_number!r} status={self.status.value!r}>"
