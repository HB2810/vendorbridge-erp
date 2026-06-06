"""
Pydantic schemas for the Dashboard statistics endpoint.
"""

from decimal import Decimal
from pydantic import BaseModel, Field


class DashboardStatsResponse(BaseModel):
    total_vendors: int = Field(..., description="Total count of all vendors")
    active_vendors: int = Field(..., description="Count of vendors with ACTIVE status")
    active_rfqs: int = Field(..., description="Count of RFQs in OPEN status")
    pending_approvals: int = Field(..., description="Count of approvals in PENDING status")
    total_purchase_orders: int = Field(..., description="Total count of all purchase orders")
    total_invoices: int = Field(..., description="Total count of all invoices")
    total_procurement_value: Decimal = Field(..., description="Sum of generated/paid invoices grand totals")

    model_config = {
        "json_schema_extra": {
            "example": {
                "total_vendors": 15,
                "active_vendors": 12,
                "active_rfqs": 4,
                "pending_approvals": 2,
                "total_purchase_orders": 8,
                "total_invoices": 5,
                "total_procurement_value": 47500.00
            }
        }
    }
