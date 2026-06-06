"""
Quotation API routes with ownership checks and role-based access control (RBAC).
"""

import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models import User, Vendor
from app.models.enums import UserRole, QuotationStatus
from app.routes.roles import require_role, require_any_role, get_current_user
from app.schemas.quotation import (
    QuotationCreate,
    QuotationUpdate,
    QuotationResponse,
    QuotationPaginationResponse,
)
from app.services import quotation_service

# Prefix-scoped router (/api/quotations)
router = APIRouter()

# Absolute-scoped router (no prefix in main.py to support /api/rfqs/... and /api/vendors/...)
absolute_router = APIRouter()


def get_vendor_by_user(db: Session, user: User) -> Vendor:
    """Helper to retrieve the Vendor record associated with the authenticated user's email."""
    vendor = db.query(Vendor).filter(Vendor.email == user.email).first()
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current user account is not associated with any registered Vendor profile.",
        )
    return vendor


@router.get(
    "",
    response_model=QuotationPaginationResponse,
    summary="List, filter, and paginate quotations",
)
def list_quotations(
    rfq_id: int | None = Query(None, description="Filter by RFQ ID"),
    vendor_id: int | None = Query(None, description="Filter by Vendor ID"),
    status_filter: QuotationStatus | None = Query(None, alias="status", description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a paginated list of quotations. VENDORS can only view their own quotations."""
    # Enforce ownership for VENDORS
    if current_user.role == UserRole.VENDOR:
        vendor = get_vendor_by_user(db, current_user)
        vendor_id_filter = vendor.id
    else:
        # ADMIN, PROCUREMENT_OFFICER, MANAGER can view any vendor's quotations
        vendor_id_filter = vendor_id

    items, total = quotation_service.get_quotations(
        db, rfq_id=rfq_id, vendor_id=vendor_id_filter, status_filter=status_filter, page=page, size=size
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
    response_model=QuotationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new quotation",
)
def create_quotation(
    data: QuotationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.VENDOR)),
):
    """Submit a quotation. Accessible only to assigned and active VENDORS."""
    vendor = get_vendor_by_user(db, current_user)
    return quotation_service.create_quotation(db, data, vendor_id=vendor.id)


@router.get(
    "/{id}",
    response_model=QuotationResponse,
    summary="Retrieve quotation details",
)
def get_quotation(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve details of a single quotation. VENDORS can only view their own."""
    quotation = quotation_service.get_quotation_by_id(db, id)
    if not quotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quotation with id {id} not found.",
        )

    # Ownership check for VENDORS
    if current_user.role == UserRole.VENDOR:
        vendor = get_vendor_by_user(db, current_user)
        if quotation.vendor_id != vendor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only view your own quotations.",
            )

    return quotation


@router.put(
    "/{id}",
    response_model=QuotationResponse,
    summary="Update quotation details",
)
def update_quotation(
    id: int,
    data: QuotationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.VENDOR)),
):
    """Update a quotation. Can only update own quotation before review starts. Accessible to VENDORS only."""
    quotation = quotation_service.get_quotation_by_id(db, id)
    if not quotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quotation with id {id} not found.",
        )

    # Ownership check
    vendor = get_vendor_by_user(db, current_user)
    if quotation.vendor_id != vendor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only update your own quotations.",
        )

    return quotation_service.update_quotation(db, id, data)


# ── Absolute Routing Endpoints ────────────────────────────────────

@absolute_router.get(
    "/api/rfqs/{id}/quotations",
    response_model=QuotationPaginationResponse,
    summary="View all quotations submitted for an RFQ",
)
def get_rfq_quotations(
    id: int,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all quotations submitted in response to an RFQ. VENDORS can only view their own."""
    if current_user.role == UserRole.VENDOR:
        vendor = get_vendor_by_user(db, current_user)
        vendor_id_filter = vendor.id
    else:
        vendor_id_filter = None

    items, total = quotation_service.get_quotations(
        db, rfq_id=id, vendor_id=vendor_id_filter, page=page, size=size
    )

    pages = math.ceil(total / size) if total > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }


@absolute_router.get(
    "/api/vendors/{id}/quotations",
    response_model=QuotationPaginationResponse,
    summary="View all quotations submitted by a Vendor",
)
def get_vendor_quotations(
    id: int,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all quotations submitted by a Vendor. VENDORS can only view their own profile's quotations."""
    if current_user.role == UserRole.VENDOR:
        vendor = get_vendor_by_user(db, current_user)
        if vendor.id != id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only view quotations of your own vendor profile.",
            )

    items, total = quotation_service.get_quotations(
        db, rfq_id=None, vendor_id=id, page=page, size=size
    )

    pages = math.ceil(total / size) if total > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }
