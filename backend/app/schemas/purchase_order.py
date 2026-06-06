from pydantic import BaseModel


class PurchaseOrderCreate(BaseModel):
    quotation_id: int
    total_amount: float


class PurchaseOrderResponse(PurchaseOrderCreate):
    id: int
    po_number: str
    status: str

    class Config:
        from_attributes = True

