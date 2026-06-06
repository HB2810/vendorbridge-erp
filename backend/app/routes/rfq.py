"""
RFQ Management API routes with role-based access control (RBAC).
"""

import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models import User
from app.models.enums import UserRole, RFQStatus
from app.routes.roles import require_role, require_any_role, get_current_user
from app.schemas.rfq import (
    RFQCreate,
    RFQUpdate,
    RFQResponse,
    RFQPaginationResponse,
    RFQVendorAssign,
)
from app.schemas.vendor import VendorResponse
from app.services import rfq_service

router = APIRouter()


@router.get(
    "",
    response_model=RFQPaginationResponse,
    summary="List, search, filter, and paginate RFQs",
)
def list_rfqs(
    search: str | None = Query(
        None, description="Search by RFQ number or title (case-insensitive)"
    ),
    category: str | None = Query(None, description="Filter by category"),
    status_filter: RFQStatus | None = Query(
        None, alias="status", description="Filter by status"
    ),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER)
    ),
):
    """Retrieve a paginated list of RFQs. Accessible to ADMIN, PROCUREMENT_OFFICER, and MANAGER."""
    items, total = rfq_service.get_rfqs(
        db, search=search, category=category, status_filter=status_filter, page=page, size=size
    )

    pages = math.ceil(total / size) if total > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }


@router.post(
    "",
    response_model=RFQResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new RFQ",
)
def create_rfq(
    data: RFQCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
    ),
):
    """Create a new RFQ and its items. Accessible to ADMIN and PROCUREMENT_OFFICER."""
    return rfq_service.create_rfq(db, data, created_by_id=current_user.id)


@router.get(
    "/{id}",
    response_model=RFQResponse,
    summary="Retrieve RFQ details",
)
def get_rfq(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER)
    ),
):
    """Retrieve detailed RFQ information. Accessible to ADMIN, PROCUREMENT_OFFICER, and MANAGER."""
    rfq = rfq_service.get_rfq_by_id(db, id)
    if not rfq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"RFQ with id {id} not found.",
        )
    return rfq


@router.put(
    "/{id}",
    response_model=RFQResponse,
    summary="Update RFQ details",
)
def update_rfq(
    id: int,
    data: RFQUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
    ),
):
    """Update RFQ details. Enforces unique number constraint. Accessible to ADMIN and PROCUREMENT_OFFICER."""
    rfq = rfq_service.update_rfq(db, id, data)
    if not rfq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"RFQ with id {id} not found.",
        )
    return rfq


@router.delete(
    "/{id}",
    response_model=RFQResponse,
    summary="Delete an RFQ",
)
def delete_rfq(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    """Delete an RFQ profile. Cascade deletes items and assignments. Accessible to ADMIN only."""
    rfq = rfq_service.delete_rfq(db, id)
    if not rfq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"RFQ with id {id} not found.",
        )
    return rfq


@router.post(
    "/{id}/vendors",
    response_model=list[VendorResponse],
    summary="Assign vendors to an RFQ",
)
def assign_vendors(
    id: int,
    data: RFQVendorAssign,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)
    ),
):
    """Assign a list of vendors to an RFQ. Accessible to ADMIN and PROCUREMENT_OFFICER."""
    return rfq_service.assign_vendors_to_rfq(db, rfq_id=id, vendor_ids=data.vendor_ids)


@router.get(
    "/{id}/vendors",
    response_model=list[VendorResponse],
    summary="View assigned vendors for an RFQ",
)
def view_assigned_vendors(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER)
    ),
):
    """Retrieve all vendors currently assigned to the RFQ. Accessible to ADMIN, PROCUREMENT_OFFICER, and MANAGER."""
    return rfq_service.get_assigned_vendors(db, rfq_id=id)
