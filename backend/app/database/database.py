"""
SQLAlchemy database engine, session factory, and declarative base.

The connection string is read from `Settings.DATABASE_URL` so it can be
swapped (e.g. to PostgreSQL) without touching any code.
"""

import logging
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

# ── Engine ────────────────────────────────────────────────────────
# `check_same_thread` is only required for SQLite; harmless for other
# dialects since SQLAlchemy silently ignores unknown connect_args.
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=settings.DEBUG,
)

# ── Session factory ───────────────────────────────────────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ── Declarative Base ──────────────────────────────────────────────
class Base(DeclarativeBase):
    """
    Shared declarative base for all ORM models.

    All model modules should import `Base` from here so that
    `Base.metadata` contains every table definition.
    """


# ── Dependency ────────────────────────────────────────────────────
def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a scoped database session.

    Usage::

        @router.get("/items")
        def list_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
