"""
Vendor service layer implementing CRUD operations, query filters, search, and soft deletes.
"""

from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.models.enums import VendorStatus
from app.schemas.vendor import VendorCreate, VendorUpdate


def get_vendors(
    db: Session,
    search: str | None = None,
    category: str | None = None,
    status_filter: VendorStatus | None = None,
    page: int = 1,
    size: int = 20,
) -> tuple[list[Vendor], int]:
    """Retrieve vendors based on filters, search query, and pagination parameters."""
    query = db.query(Vendor)

    if search:
        query = query.filter(Vendor.company_name.ilike(f"%{search}%"))

    if category:
        query = query.filter(Vendor.category == category)

    if status_filter:
        query = query.filter(Vendor.status == status_filter)

    total = query.count()

    # Pagination
    offset = (page - 1) * size
    items = query.order_by(Vendor.id.desc()).offset(offset).limit(size).all()

    return items, total


def get_vendor_by_id(db: Session, vendor_id: int) -> Vendor | None:
    """Retrieve a single vendor by primary key."""
    return db.query(Vendor).filter(Vendor.id == vendor_id).first()


def create_vendor(db: Session, data: VendorCreate) -> Vendor:
    """Create a new vendor. Enforces unique vendor_code and unique email constraints."""
    # Check duplicate vendor code
    if db.query(Vendor).filter(Vendor.vendor_code == data.vendor_code).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vendor with code '{data.vendor_code}' already exists.",
        )

    # Check duplicate email
    if db.query(Vendor).filter(Vendor.email == data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vendor with email '{data.email}' already exists.",
        )

    new_vendor = Vendor(**data.model_dump())
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return new_vendor


def update_vendor(db: Session, vendor_id: int, data: VendorUpdate) -> Vendor | None:
    """Update an existing vendor's fields and handle duplicate validation checks."""
    vendor = get_vendor_by_id(db, vendor_id)
    if not vendor:
        return None

    update_fields = data.model_dump(exclude_unset=True)

    # Check unique vendor code
    new_code = update_fields.get("vendor_code")
    if new_code and new_code != vendor.vendor_code:
        if db.query(Vendor).filter(Vendor.vendor_code == new_code).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vendor with code '{new_code}' already exists.",
            )

    # Check unique email
    new_email = update_fields.get("email")
    if new_email and new_email != vendor.email:
        if db.query(Vendor).filter(Vendor.email == new_email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vendor with email '{new_email}' already exists.",
            )

    for field, value in update_fields.items():
        setattr(vendor, field, value)

    db.commit()
    db.refresh(vendor)
    return vendor


def delete_vendor(db: Session, vendor_id: int) -> Vendor | None:
    """Soft delete a vendor by setting their status to INACTIVE."""
    vendor = get_vendor_by_id(db, vendor_id)
    if not vendor:
        return None

    vendor.status = VendorStatus.INACTIVE
    db.commit()
    db.refresh(vendor)
    return vendor
