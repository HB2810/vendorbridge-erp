"""
Approval workflow API routes with role-based access control (RBAC).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.models.enums import UserRole
from app.routes.roles import require_role, require_any_role, get_current_user
from app.routes.quotation import get_vendor_by_user
from app.schemas.approval import ApprovalAction, ApprovalResponse
from app.services import approval_service

router = APIRouter()


@router.get(
    "",
    response_model=list[ApprovalResponse],
    summary="View approval logs",
)
def list_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve approvals list.
    ADMIN, PROCUREMENT_OFFICER, and MANAGER can view all approvals.
    VENDOR users can view approvals only for their own quotations.
    """
    if current_user.role == UserRole.VENDOR:
        vendor = get_vendor_by_user(db, current_user)
        vendor_id = vendor.id
    else:
        vendor_id = None

    return approval_service.get_approvals(db, vendor_id=vendor_id)


@router.post(
    "/{quotation_id}/approve",
    response_model=ApprovalResponse,
    summary="Approve a quotation",
)
def approve_quotation(
    quotation_id: int,
    data: ApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(UserRole.ADMIN, UserRole.MANAGER)),
):
    """
    Approve a quotation and change its status to ACCEPTED.
    Accessible to MANAGER and ADMIN only.
    """
    return approval_service.approve_quotation(
        db, quotation_id=quotation_id, user_id=current_user.id, remarks=data.remarks
    )


@router.post(
    "/{quotation_id}/reject",
    response_model=ApprovalResponse,
    summary="Reject a quotation",
)
def reject_quotation(
    quotation_id: int,
    data: ApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(UserRole.ADMIN, UserRole.MANAGER)),
):
    """
    Reject a quotation and change its status to REJECTED.
    Accessible to MANAGER and ADMIN only.
    """
    return approval_service.reject_quotation(
        db, quotation_id=quotation_id, user_id=current_user.id, remarks=data.remarks
    )
