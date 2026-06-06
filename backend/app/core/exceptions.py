"""
Centralized exception handlers for standardizing API error responses.
"""

import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers on the FastAPI application."""

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        logger.warning("HTTPException: %s - status_code=%s", exc.detail, exc.status_code)
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        # Format errors into a simple list of messages
        errors = []
        for err in exc.errors():
            loc = " -> ".join(str(x) for x in err["loc"])
            errors.append(f"{loc}: {err['msg']}")
        
        detail_msg = "Validation error: " + "; ".join(errors)
        logger.warning("RequestValidationError: %s", detail_msg)
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": detail_msg,
                "errors": exc.errors()
            },
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request: Request, exc: IntegrityError):
        # Extract cause if possible or generic database constraints message
        detail_msg = "Database integrity constraint violation. Unique or foreign key constraint failed."
        orig_msg = str(exc.orig) if exc.orig else str(exc)
        logger.error("IntegrityError: %s - %s", detail_msg, orig_msg)
        
        # Check specific constraints
        if "UNIQUE" in orig_msg.upper():
            detail_msg = "Unique constraint violation: record with this identifier already exists."
        elif "FOREIGN KEY" in orig_msg.upper():
            detail_msg = "Foreign key constraint violation: referenced record not found."
            
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": detail_msg},
        )

    @app.exception_handler(SQLAlchemyError)
    async def database_exception_handler(request: Request, exc: SQLAlchemyError):
        logger.error("Database error occurred: %s", str(exc))
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "A database error occurred while processing the request."},
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.exception("Unexpected error occurred: %s", str(exc))
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred. Please contact the administrator."},
        )
