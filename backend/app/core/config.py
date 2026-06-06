from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "VendorBridge"
    database_url: str = "sqlite:///./vendorbridge.db"
    secret_key: str = "change-this-secret-key-before-production"
    access_token_expire_minutes: int = 60


@lru_cache
def get_settings() -> Settings:
    return Settings()

