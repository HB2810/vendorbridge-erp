"""
VendorBridge ERP — Application entry point.

Creates the FastAPI application, wires up middleware and lifespan events,
and exposes a health-check root endpoint.

Run in development with::

    uvicorn app.main:app --reload
"""

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.database.database import Base, engine

# ── Logging ───────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)-8s │ %(name)s │ %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

settings = get_settings()


# ── Lifespan ──────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup / shutdown lifecycle hook."""
    logger.info("=" * 60)
    logger.info("  🚀  %s v%s  —  starting up", settings.APP_NAME, settings.APP_VERSION)
    logger.info("  📦  Database : %s", settings.DATABASE_URL)
    logger.info("  🐛  Debug    : %s", settings.DEBUG)
    logger.info("=" * 60)

    # Create all tables defined via Base.metadata (no-op when empty).
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified / created.")

    yield  # ← application runs here

    logger.info("%s shutting down. Goodbye! 👋", settings.APP_NAME)


# ── FastAPI application ──────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",       # Swagger UI
    redoc_url="/redoc",     # ReDoc alternative
    openapi_url="/openapi.json",
)

# ── CORS (permissive for local dev; tighten for production) ──────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Root endpoint ────────────────────────────────────────────────
@app.get(
    "/",
    tags=["Health"],
    summary="API health check",
    response_description="Confirms the API is running",
)
async def root() -> dict[str, str]:
    """Return a simple status message confirming the API is operational."""
    return {"message": "VendorBridge ERP API Running"}
