from fastapi import APIRouter

from app.schemas.purchase_order import PurchaseOrderCreate

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])


@router.get("/")
def list_purchase_orders() -> list[dict[str, str]]:
    return []


@router.post("/")
def create_purchase_order(payload: PurchaseOrderCreate) -> dict[str, int | str]:
    return {"message": "purchase order created", "quotation_id": payload.quotation_id}

