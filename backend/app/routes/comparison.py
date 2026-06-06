from fastapi import APIRouter

router = APIRouter(prefix="/comparison", tags=["Comparison"])


@router.get("/rfq/{rfq_id}")
def compare_quotations(rfq_id: int) -> dict[str, int | list[dict[str, str]]]:
    return {"rfq_id": rfq_id, "ranked_quotations": []}

