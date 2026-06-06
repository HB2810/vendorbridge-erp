from pydantic import BaseModel


class InvoiceCreate(BaseModel):
    purchase_order_id: int
    invoice_number: str
    amount: float


class InvoiceResponse(InvoiceCreate):
    id: int
    status: str

    class Config:
        from_attributes = True

