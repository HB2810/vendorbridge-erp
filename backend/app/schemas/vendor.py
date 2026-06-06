"""
Pydantic schemas for Vendor validation and query serialization.
"""

from datetime import datetime
from decimal import Decimal
import re
from pydantic import BaseModel, Field, field_validator

from app.models.enums import VendorStatus

EMAIL_PATTERN = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
GST_REGEX = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"


class VendorCreate(BaseModel):
    vendor_code: str = Field(..., min_length=2, max_length=50)
    company_name: str = Field(..., min_length=1, max_length=255)
    category: str | None = Field(None, max_length=100)
    gst_number: str | None = Field(None, description="15-character GSTIN format")
    contact_person: str = Field(..., min_length=1, max_length=150)
    email: str = Field(..., pattern=EMAIL_PATTERN)
    phone: str | None = Field(None, max_length=20)
    address: str | None = Field(None)
    status: VendorStatus = Field(default=VendorStatus.ACTIVE)
    rating: Decimal | None = Field(
        None, ge=Decimal("0.00"), le=Decimal("5.00"), description="Rating out of 5"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "vendor_code": "VND-ACME",
                "company_name": "Acme Industrial Corp",
                "category": "Manufacturing",
                "gst_number": "27AAAAA1111A1Z1",
                "contact_person": "John Doe",
                "email": "vendor@acme.com",
                "phone": "+919876543210",
                "address": "123 Industrial Estate, Mumbai",
                "status": "ACTIVE",
                "rating": 4.5,
            }
        }
    }

    @field_validator("gst_number")
    @classmethod
    def validate_gst(cls, v: str | None) -> str | None:
        if v is not None:
            v_upper = v.upper().strip()
            if not re.match(GST_REGEX, v_upper):
                raise ValueError("Invalid GST number format. Must match standard 15-digit GSTIN.")
            return v_upper
        return v


class VendorUpdate(BaseModel):
    vendor_code: str | None = Field(None, min_length=2, max_length=50)
    company_name: str | None = Field(None, min_length=1, max_length=255)
    category: str | None = Field(None, max_length=100)
    gst_number: str | None = Field(None, description="15-character GSTIN format")
    contact_person: str | None = Field(None, min_length=1, max_length=150)
    email: str | None = Field(None, pattern=EMAIL_PATTERN)
    phone: str | None = Field(None, max_length=20)
    address: str | None = Field(None)
    status: VendorStatus | None = Field(None)
    rating: Decimal | None = Field(
        None, ge=Decimal("0.00"), le=Decimal("5.00"), description="Rating out of 5"
    )

    @field_validator("gst_number")
    @classmethod
    def validate_gst(cls, v: str | None) -> str | None:
        if v is not None:
            v_upper = v.upper().strip()
            if not re.match(GST_REGEX, v_upper):
                raise ValueError("Invalid GST number format. Must match standard 15-digit GSTIN.")
            return v_upper
        return v


class VendorResponse(BaseModel):
    id: int
    vendor_code: str
    company_name: str
    category: str | None
    gst_number: str | None
    contact_person: str
    email: str
    phone: str | None
    address: str | None
    status: VendorStatus
    rating: Decimal | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VendorPaginationResponse(BaseModel):
    items: list[VendorResponse]
    total: int
    page: int
    size: int
    pages: int
