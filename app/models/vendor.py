from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160), index=True)
    contact_email: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(50), default="active")

