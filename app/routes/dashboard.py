from fastapi import APIRouter

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def dashboard_summary() -> dict[str, int]:
    return {
        "vendors": 0,
        "rfqs": 0,
        "quotations": 0,
        "pending_approvals": 0,
        "purchase_orders": 0,
        "invoices": 0,
    }

