"""
Pydantic schemas for Purchase Order creation and serialization.
"""

from datetime import datetime
from pydantic import BaseModel, Field
from app.models.enums import PurchaseOrderStatus


class PurchaseOrderCreate(BaseModel):
    quotation_id: int = Field(..., description="Quotation ID to generate PO from")


class PurchaseOrderResponse(BaseModel):
    id: int
    po_number: str
    quotation_id: int
    vendor_id: int
    status: PurchaseOrderStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
