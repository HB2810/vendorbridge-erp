"""
Service layer for Approval workflow operations.
"""

from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.approval import Approval
from app.models.quotation import Quotation
from app.models.enums import ApprovalStatus, QuotationStatus


def get_approvals(db: Session, vendor_id: int | None = None) -> list[Approval]:
    """Retrieve approvals, with optional vendor filtration for VENDOR role access."""
    query = db.query(Approval)
    if vendor_id is not None:
        query = query.join(Quotation).filter(Quotation.vendor_id == vendor_id)
    return query.order_by(Approval.id.desc()).all()


def process_approval(
    db: Session,
    quotation_id: int,
    user_id: int,
    approve: bool,
    remarks: str | None = None,
) -> Approval:
    """Core logic to approve or reject a quotation."""
    # Check quotation existence
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quotation with id {quotation_id} not found.",
        )

    # Check status eligibility
    if quotation.status not in (QuotationStatus.SUBMITTED, QuotationStatus.UNDER_REVIEW):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve/reject quotation in '{quotation.status.value}' status.",
        )

    # Determine status updates
    target_q_status = QuotationStatus.ACCEPTED if approve else QuotationStatus.REJECTED
    target_app_status = ApprovalStatus.APPROVED if approve else ApprovalStatus.REJECTED

    # Update quotation status
    quotation.status = target_q_status

    # Create or update unique approval record
    approval = db.query(Approval).filter(Approval.quotation_id == quotation_id).first()
    if not approval:
        approval = Approval(
            quotation_id=quotation_id,
            approved_by=user_id,
            status=target_app_status,
            remarks=remarks,
            approved_at=datetime.now(timezone.utc),
        )
        db.add(approval)
    else:
        approval.approved_by = user_id
        approval.status = target_app_status
        approval.remarks = remarks
        approval.approved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(approval)
    return approval


def approve_quotation(db: Session, quotation_id: int, user_id: int, remarks: str | None = None) -> Approval:
    """Approve a quotation and transition its status to ACCEPTED."""
    return process_approval(db, quotation_id, user_id, approve=True, remarks=remarks)


def reject_quotation(db: Session, quotation_id: int, user_id: int, remarks: str | None = None) -> Approval:
    """Reject a quotation and transition its status to REJECTED."""
    return process_approval(db, quotation_id, user_id, approve=False, remarks=remarks)
