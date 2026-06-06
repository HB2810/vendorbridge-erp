from fastapi import APIRouter

from app.schemas.invoice import InvoiceCreate

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.get("/")
def list_invoices() -> list[dict[str, str]]:
    return []


@router.post("/")
def create_invoice(payload: InvoiceCreate) -> dict[str, str]:
    return {"message": "invoice created", "invoice_number": payload.invoice_number}

