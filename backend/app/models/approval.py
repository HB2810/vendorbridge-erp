from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Approval(Base):
    __tablename__ = "approvals"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    quotation_id: Mapped[int] = mapped_column(ForeignKey("quotations.id"))
    approver_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(50), default="pending")
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)

