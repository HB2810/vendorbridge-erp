"""
Dashboard API route with role-based access control (RBAC).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.enums import UserRole
from app.routes.roles import require_any_role
from app.schemas.dashboard import DashboardStatsResponse
from app.services import dashboard_service

router = APIRouter()


@router.get(
    "/stats",
    response_model=DashboardStatsResponse,
    summary="Retrieve aggregate ERP metrics",
)
def get_stats(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER)
    ),
):
    """
    Retrieve aggregate counts and value totals across the ERP.
    Accessible to ADMIN, PROCUREMENT_OFFICER, and MANAGER. VENDOR users are denied access.
    """
    return dashboard_service.get_dashboard_stats(db)
