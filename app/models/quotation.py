from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Quotation(Base):
    __tablename__ = "quotations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    rfq_id: Mapped[int] = mapped_column(ForeignKey("rfqs.id"))
    vendor_id: Mapped[int] = mapped_column(ForeignKey("vendors.id"))
    quoted_amount: Mapped[float] = mapped_column(Float)
    delivery_days: Mapped[int]
    status: Mapped[str] = mapped_column(String(50), default="submitted")

