"""
Pydantic schemas for RFQ and RFQ Item payload validation.
"""

from datetime import datetime, timezone
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator

from app.models.enums import RFQStatus


class RFQItemCreate(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None)
    quantity: Decimal = Field(..., gt=Decimal("0.000"), description="Quantity must be greater than 0")
    unit: str = Field(default="pcs", max_length=20)


class RFQItemResponse(BaseModel):
    id: int
    rfq_id: int
    item_name: str
    description: str | None
    quantity: Decimal
    unit: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RFQCreate(BaseModel):
    rfq_number: str = Field(..., min_length=1, max_length=30)
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None)
    category: str | None = Field(None, max_length=100)
    deadline: datetime = Field(..., description="Submission deadline date and time")
    items: list[RFQItemCreate] = Field(
        ..., min_length=1, description="RFQ must contain at least one item"
    )
    status: RFQStatus = Field(default=RFQStatus.DRAFT)

    @field_validator("deadline")
    @classmethod
    def validate_deadline(cls, v: datetime) -> datetime:
        now = datetime.now(v.tzinfo or timezone.utc)
        if v <= now:
            raise ValueError("RFQ deadline must be in the future.")
        return v


class RFQUpdate(BaseModel):
    rfq_number: str | None = Field(None, min_length=1, max_length=30)
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None)
    category: str | None = Field(None, max_length=100)
    deadline: datetime | None = Field(None, description="Submission deadline date and time")
    status: RFQStatus | None = Field(None)

    @field_validator("deadline")
    @classmethod
    def validate_deadline(cls, v: datetime | None) -> datetime | None:
        if v is not None:
            now = datetime.now(v.tzinfo or timezone.utc)
            if v <= now:
                raise ValueError("RFQ deadline must be in the future.")
        return v


class RFQResponse(BaseModel):
    id: int
    rfq_number: str
    title: str
    description: str | None
    category: str | None
    deadline: datetime
    status: RFQStatus
    created_by: int
    created_at: datetime
    updated_at: datetime
    items: list[RFQItemResponse]

    model_config = {"from_attributes": True}


class RFQPaginationResponse(BaseModel):
    items: list[RFQResponse]
    total: int
    page: int
    size: int
    pages: int


class RFQVendorAssign(BaseModel):
    vendor_ids: list[int] = Field(..., min_length=1, description="List of vendor IDs to assign")
