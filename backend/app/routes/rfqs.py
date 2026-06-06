from fastapi import APIRouter

from app.schemas.rfq import RFQCreate

router = APIRouter(prefix="/rfqs", tags=["RFQs"])


@router.get("/")
def list_rfqs() -> list[dict[str, str]]:
    return []


@router.post("/")
def create_rfq(payload: RFQCreate) -> dict[str, str]:
    return {"message": "rfq created", "title": payload.title}

