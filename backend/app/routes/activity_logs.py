from fastapi import APIRouter

router = APIRouter(prefix="/activity-logs", tags=["Activity Logs"])


@router.get("/")
def list_activity_logs() -> list[dict[str, str]]:
    return []

