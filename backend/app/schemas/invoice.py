"""
Pydantic schemas for Invoice generation and serialization.
"""

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.enums import InvoiceStatus


class InvoiceCreate(BaseModel):
    purchase_order_id: int = Field(..., description="Purchase Order ID to generate invoice from")
    payment_terms: str | None = Field(None, max_length=255, description="Optional payment terms")
    due_date: datetime | None = Field(None, description="Due date of the invoice (defaults to 30 days from now)")


class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    purchase_order_id: int
    subtotal: Decimal
    tax: Decimal
    grand_total: Decimal
    payment_terms: str | None
    due_date: datetime
    status: InvoiceStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
