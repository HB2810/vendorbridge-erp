from pydantic import BaseModel


class ApprovalDecision(BaseModel):
    quotation_id: int
    status: str
    remarks: str | None = None


class ApprovalResponse(ApprovalDecision):
    id: int
    approver_id: int

    class Config:
        from_attributes = True

