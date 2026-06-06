"""
Application configuration loaded from environment variables.

Uses pydantic-settings v2 so every field can be overridden via an env var
or a `.env` file placed alongside the project root.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the VendorBridge ERP API."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────
    APP_NAME: str = "VendorBridge ERP"
    APP_VERSION: str = "0.1.0"
    APP_DESCRIPTION: str = (
        "Procurement workflow backend for vendor, RFQ, quotation, "
        "approval, PO, and invoice management."
    )
    DEBUG: bool = False

    # ── Database ─────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./vendorbridge.db"

    # ── Security ─────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "supersecretkeychangeinprod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60



@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton of the application settings."""
    return Settings()
