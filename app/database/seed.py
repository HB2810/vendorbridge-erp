from app.database.database import Base, engine
from app.models import activity_log, approval, invoice, purchase_order, quotation, rfq, user, vendor  # noqa: F401


def seed_database() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    seed_database()
