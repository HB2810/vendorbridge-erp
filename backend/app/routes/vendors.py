from fastapi import APIRouter

from app.schemas.vendor import VendorCreate

router = APIRouter(prefix="/vendors", tags=["Vendors"])


@router.get("/")
def list_vendors() -> list[dict[str, str]]:
    return []


@router.post("/")
def create_vendor(payload: VendorCreate) -> dict[str, str]:
    return {"message": "vendor created", "name": payload.name}

