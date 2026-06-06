"""
RFQ service layer implementing CRUD operations, validation logic, and vendor assignments.
"""

from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.rfq import RFQ
from app.models.rfq_item import RFQItem
from app.models.rfq_vendor import RFQVendor
from app.models.vendor import Vendor
from app.models.enums import RFQStatus, VendorStatus
from app.schemas.rfq import RFQCreate, RFQUpdate


def get_rfqs(
    db: Session,
    search: str | None = None,
    category: str | None = None,
    status_filter: RFQStatus | None = None,
    page: int = 1,
    size: int = 20,
) -> tuple[list[RFQ], int]:
    """Retrieve RFQs with optional search, filtering, and pagination."""
    query = db.query(RFQ).options(joinedload(RFQ.items))

    if search:
        query = query.filter(
            (RFQ.rfq_number.ilike(f"%{search}%")) | (RFQ.title.ilike(f"%{search}%"))
        )

    if category:
        query = query.filter(RFQ.category == category)

    if status_filter:
        query = query.filter(RFQ.status == status_filter)

    total = query.count()

    # Pagination
    offset = (page - 1) * size
    items = query.order_by(RFQ.id.desc()).offset(offset).limit(size).all()

    return items, total


def get_rfq_by_id(db: Session, rfq_id: int) -> RFQ | None:
    """Retrieve an RFQ by ID."""
    return db.query(RFQ).options(joinedload(RFQ.items)).filter(RFQ.id == rfq_id).first()


def create_rfq(db: Session, data: RFQCreate, created_by_id: int) -> RFQ:
    """Create a new RFQ along with its items within a transaction."""
    # Check duplicate RFQ number
    if db.query(RFQ).filter(RFQ.rfq_number == data.rfq_number).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"RFQ with number '{data.rfq_number}' already exists.",
        )

    # Validate deadline is in the future
    deadline = data.deadline
    if deadline.tzinfo is None:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
    else:
        now = datetime.now(timezone.utc)
    if deadline <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RFQ deadline must be in the future.",
        )

    # Validate RFQ has at least one item
    if not data.items or len(data.items) < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RFQ must contain at least one item.",
        )

    # Create RFQ header
    new_rfq = RFQ(
        rfq_number=data.rfq_number,
        title=data.title,
        description=data.description,
        category=data.category,
        deadline=data.deadline,
        status=data.status,
        created_by=created_by_id,
    )
    db.add(new_rfq)
    db.flush()  # Gets us new_rfq.id

    # Create RFQ items
    for item_data in data.items:
        new_item = RFQItem(
            rfq_id=new_rfq.id,
            item_name=item_data.item_name,
            description=item_data.description,
            quantity=item_data.quantity,
            unit=item_data.unit,
        )
        db.add(new_item)

    db.commit()
    db.refresh(new_rfq)
    return new_rfq


def update_rfq(db: Session, rfq_id: int, data: RFQUpdate) -> RFQ | None:
    """Update RFQ details and handle duplicate RFQ number checks."""
    rfq = get_rfq_by_id(db, rfq_id)
    if not rfq:
        return None

    update_fields = data.model_dump(exclude_unset=True)

    # Check unique RFQ number
    new_num = update_fields.get("rfq_number")
    if new_num and new_num != rfq.rfq_number:
        if db.query(RFQ).filter(RFQ.rfq_number == new_num).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"RFQ with number '{new_num}' already exists.",
            )

    # Check deadline if updated
    new_deadline = update_fields.get("deadline")
    if new_deadline:
        if new_deadline.tzinfo is None:
            now = datetime.now(timezone.utc).replace(tzinfo=None)
        else:
            now = datetime.now(timezone.utc)
        if new_deadline <= now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="RFQ deadline must be in the future.",
            )

    for field, value in update_fields.items():
        setattr(rfq, field, value)

    db.commit()
    db.refresh(rfq)
    return rfq


def delete_rfq(db: Session, rfq_id: int) -> RFQ | None:
    """Perform a hard delete on an RFQ. Items and assignments are cascade deleted."""
    rfq = get_rfq_by_id(db, rfq_id)
    if not rfq:
        return None

    db.delete(rfq)
    db.commit()
    return rfq


def assign_vendors_to_rfq(db: Session, rfq_id: int, vendor_ids: list[int]) -> list[Vendor]:
    """Assign vendors to an RFQ. Enforces active status and duplicates constraints."""
    rfq = get_rfq_by_id(db, rfq_id)
    if not rfq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"RFQ with id {rfq_id} not found.",
        )

    # Check duplicate inputs
    if len(vendor_ids) != len(set(vendor_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate vendor IDs in request.",
        )

    # Validate each vendor
    for v_id in vendor_ids:
        vendor = db.query(Vendor).filter(Vendor.id == v_id).first()
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vendor with id {v_id} does not exist.",
            )

        if vendor.status != VendorStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot assign inactive vendor with id {v_id}.",
            )

        # Check if already assigned
        exists = (
            db.query(RFQVendor)
            .filter(RFQVendor.rfq_id == rfq_id, RFQVendor.vendor_id == v_id)
            .first()
        )
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vendor with id {v_id} is already assigned to this RFQ.",
            )

    # Add assignments
    for v_id in vendor_ids:
        assignment = RFQVendor(rfq_id=rfq_id, vendor_id=v_id)
        db.add(assignment)

    db.commit()
    return get_assigned_vendors(db, rfq_id)


def get_assigned_vendors(db: Session, rfq_id: int) -> list[Vendor]:
    """Retrieve all vendors assigned to a specific RFQ."""
    rfq = get_rfq_by_id(db, rfq_id)
    if not rfq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"RFQ with id {rfq_id} not found.",
        )

    return (
        db.query(Vendor)
        .join(RFQVendor, RFQVendor.vendor_id == Vendor.id)
        .filter(RFQVendor.rfq_id == rfq_id)
        .all()
    )
