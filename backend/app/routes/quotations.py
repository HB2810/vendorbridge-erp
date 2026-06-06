from fastapi import APIRouter

from app.schemas.quotation import QuotationCreate

router = APIRouter(prefix="/quotations", tags=["Quotations"])


@router.get("/")
def list_quotations() -> list[dict[str, str]]:
    return []


@router.post("/")
def submit_quotation(payload: QuotationCreate) -> dict[str, float | str]:
    return {"message": "quotation submitted", "amount": payload.quoted_amount}

