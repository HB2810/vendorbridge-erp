"""
Vendor Management API routes with role-based access control (RBAC).
"""

import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.enums import UserRole, VendorStatus
from app.routes.roles import require_role, require_any_role
from app.schemas.vendor import (
    VendorCreate,
    VendorUpdate,
    VendorResponse,
    VendorPaginationResponse,
)
from app.services import vendor_service

router = APIRouter()


@router.get(
    "",
    response_model=VendorPaginationResponse,
    summary="List, search, filter, and paginate vendors",
)
def list_vendors(
    search: str | None = Query(None, description="Search by company name (case-insensitive)"),
    category: str | None = Query(None, description="Filter by category"),
    status_filter: VendorStatus | None = Query(None, alias="status", description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER)
    ),
):
    """Retrieve a paginated list of vendors. Accessible to ADMIN, PROCUREMENT_OFFICER, and MANAGER."""
    items, total = vendor_service.get_vendors(
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
    response_model=VendorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new vendor",
)
def create_vendor(
    data: VendorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)),
):
    """Register a new vendor profile. Enforces unique vendor_code and unique email. Accessible to ADMIN and PROCUREMENT_OFFICER."""
    return vendor_service.create_vendor(db, data)


@router.get(
    "/{id}",
    response_model=VendorResponse,
    summary="Retrieve vendor profile details",
)
def get_vendor(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER)
    ),
):
    """Retrieve detailed vendor profile information. Accessible to ADMIN, PROCUREMENT_OFFICER, and MANAGER."""
    vendor = vendor_service.get_vendor_by_id(db, id)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor with id {id} not found.",
        )
    return vendor


@router.put(
    "/{id}",
    response_model=VendorResponse,
    summary="Update vendor profile details",
)
def update_vendor(
    id: int,
    data: VendorUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)),
):
    """Update vendor profile details. Enforces unique constraint checks. Accessible to ADMIN and PROCUREMENT_OFFICER."""
    vendor = vendor_service.update_vendor(db, id, data)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor with id {id} not found.",
        )
    return vendor


@router.delete(
    "/{id}",
    response_model=VendorResponse,
    summary="Soft delete vendor profile",
)
def delete_vendor(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(UserRole.ADMIN)),
):
    """Soft delete vendor profile by changing status to INACTIVE. Accessible to ADMIN only."""
    vendor = vendor_service.delete_vendor(db, id)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor with id {id} not found.",
        )
    return vendor
