"""
User model — system users with role-based access.
"""

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base
from app.models.base import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role: Mapped[str] = mapped_column(
        String(30), nullable=False, default="viewer", index=True
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True
    )

    # ── Relationships ─────────────────────────────────────────
    rfqs: Mapped[list["RFQ"]] = relationship(  # noqa: F821
        back_populates="creator", foreign_keys="RFQ.created_by"
    )
    approvals: Mapped[list["Approval"]] = relationship(  # noqa: F821
        back_populates="approver"
    )
    issued_purchase_orders: Mapped[list["PurchaseOrder"]] = relationship(  # noqa: F821
        back_populates="issuer", foreign_keys="PurchaseOrder.issued_by"
    )
    submitted_invoices: Mapped[list["Invoice"]] = relationship(  # noqa: F821
        back_populates="submitter", foreign_keys="Invoice.submitted_by"
    )
    activity_logs: Mapped[list["ActivityLog"]] = relationship(  # noqa: F821
        back_populates="user"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role!r}>"
