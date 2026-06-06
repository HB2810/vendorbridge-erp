from pydantic import BaseModel


class QuotationCreate(BaseModel):
    rfq_id: int
    vendor_id: int
    quoted_amount: float
    delivery_days: int


class QuotationResponse(QuotationCreate):
    id: int
    status: str

    class Config:
        from_attributes = True

