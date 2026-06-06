"""
Pydantic schemas for Quotation validation and serialization.
"""

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

from app.models.enums import QuotationStatus


class QuotationCreate(BaseModel):
    rfq_id: int = Field(..., description="Target RFQ ID")
    subtotal: Decimal = Field(..., gt=Decimal("0.00"), description="Quotation subtotal amount")
    tax_percent: Decimal = Field(
        ..., ge=Decimal("0.00"), le=Decimal("100.00"), description="Tax percent (0 to 100)"
    )
    delivery_days: int = Field(..., gt=0, description="Estimated delivery lead time in days")
    remarks: str | None = Field(None, description="Optional remarks or notes")
    status: QuotationStatus = Field(default=QuotationStatus.SUBMITTED)


class QuotationUpdate(BaseModel):
    subtotal: Decimal | None = Field(None, gt=Decimal("0.00"))
    tax_percent: Decimal | None = Field(None, ge=Decimal("0.00"), le=Decimal("100.00"))
    delivery_days: int | None = Field(None, gt=0)
    remarks: str | None = Field(None)
    status: QuotationStatus | None = Field(None)


class QuotationResponse(BaseModel):
    id: int
    rfq_id: int
    vendor_id: int
    subtotal: Decimal
    tax_percent: Decimal
    grand_total: Decimal
    delivery_days: int
    remarks: str | None
    status: QuotationStatus
    submitted_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QuotationPaginationResponse(BaseModel):
    items: list[QuotationResponse]
    total: int
    page: int
    size: int
    pages: int
