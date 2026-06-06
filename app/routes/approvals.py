from fastapi import APIRouter

from app.schemas.approval import ApprovalDecision

router = APIRouter(prefix="/approvals", tags=["Approvals"])


@router.get("/")
def list_approvals() -> list[dict[str, str]]:
    return []


@router.post("/decision")
def decide_approval(payload: ApprovalDecision) -> dict[str, str]:
    return {"message": "approval decision recorded", "status": payload.status}

