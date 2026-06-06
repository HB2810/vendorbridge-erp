"""
Pydantic schemas for Quotation Comparison and Recommendation results.
"""

from decimal import Decimal
from pydantic import BaseModel, Field
from app.models.enums import QuotationStatus


class QuotationComparisonItem(BaseModel):
    vendor_name: str = Field(..., description="Company name of the vendor")
    vendor_rating: Decimal | None = Field(None, description="Vendor rating out of 5.0")
    subtotal: Decimal = Field(..., description="Quotation subtotal amount")
    tax: Decimal = Field(..., description="Calculated tax amount (subtotal * tax_percent / 100)")
    tax_percent: Decimal = Field(..., description="Tax percentage")
    grand_total: Decimal = Field(..., description="Quotation grand total amount")
    delivery_days: int = Field(..., description="Delivery lead time in days")
    status: QuotationStatus = Field(..., description="Current status of the quotation")

    model_config = {"from_attributes": True}


class RecommendationResponse(BaseModel):
    recommended_vendor: str = Field(..., description="Company name of the recommended vendor")
    score: int = Field(..., description="Calculated recommendation score (0-100)")
    reason: str = Field(..., description="Reason for recommendation (e.g. Lowest price, Fastest delivery)")
