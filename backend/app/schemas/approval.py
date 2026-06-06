"""
Pydantic schemas for Approval workflow steps.
"""

from datetime import datetime
from pydantic import BaseModel, Field
from app.models.enums import ApprovalStatus


class ApprovalAction(BaseModel):
    remarks: str | None = Field(None, max_length=1000, description="Approval or rejection remarks")


class ApprovalResponse(BaseModel):
    id: int
    quotation_id: int
    approved_by: int
    status: ApprovalStatus
    remarks: str | None
    approved_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
