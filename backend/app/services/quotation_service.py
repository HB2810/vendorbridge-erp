"""
Quotation service layer implementing database CRUD operations, business rules validation, and grand total calculations.
"""

from datetime import datetime, timezone
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.quotation import Quotation
from app.models.rfq import RFQ
from app.models.vendor import Vendor
from app.models.rfq_vendor import RFQVendor
from app.models.enums import RFQStatus, VendorStatus, QuotationStatus
from app.schemas.quotation import QuotationCreate, QuotationUpdate


def get_quotations(
    db: Session,
    rfq_id: int | None = None,
    vendor_id: int | None = None,
    status_filter: QuotationStatus | None = None,
    page: int = 1,
    size: int = 20,
) -> tuple[list[Quotation], int]:
    """Retrieve quotations matching filters with pagination."""
    query = db.query(Quotation)

    if rfq_id is not None:
        query = query.filter(Quotation.rfq_id == rfq_id)

    if vendor_id is not None:
        query = query.filter(Quotation.vendor_id == vendor_id)

    if status_filter is not None:
        query = query.filter(Quotation.status == status_filter)

    total = query.count()

    # Pagination
    offset = (page - 1) * size
    items = query.order_by(Quotation.id.desc()).offset(offset).limit(size).all()

    return items, total


def get_quotation_by_id(db: Session, quotation_id: int) -> Quotation | None:
    """Retrieve a single quotation by ID."""
    return db.query(Quotation).filter(Quotation.id == quotation_id).first()


def calculate_grand_total(subtotal: Decimal, tax_percent: Decimal) -> Decimal:
    """Calculate the grand total: subtotal + (subtotal * tax_percent / 100)."""
    tax_factor = tax_percent / Decimal("100.00")
    total = subtotal + (subtotal * tax_factor)
    return total.quantize(Decimal("0.01"))


def create_quotation(db: Session, data: QuotationCreate, vendor_id: int) -> Quotation:
    """Create a new quotation for an RFQ, validating all procurement business rules."""
    # Check RFQ existence
    rfq = db.query(RFQ).filter(RFQ.id == data.rfq_id).first()
    if not rfq:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"RFQ with id {data.rfq_id} does not exist.",
        )

    # Check RFQ status is OPEN
    if rfq.status != RFQStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit quotation. RFQ is currently in '{rfq.status.value}' status.",
        )

    # Check RFQ deadline is not expired
    deadline = rfq.deadline
    if deadline.tzinfo is None:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
    else:
        now = datetime.now(timezone.utc)
    if deadline <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot submit quotation. RFQ submission deadline has expired.",
        )

    # Check Vendor existence
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vendor with id {vendor_id} does not exist.",
        )

    # Check Vendor is active
    if vendor.status != VendorStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot submit quotation. Vendor account is inactive.",
        )

    # Check Vendor assignment to the RFQ
    assignment = (
        db.query(RFQVendor)
        .filter(RFQVendor.rfq_id == data.rfq_id, RFQVendor.vendor_id == vendor_id)
        .first()
    )
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot submit quotation. Vendor is not assigned to this RFQ.",
        )

    # Check Duplicate Quotation Prevention (only one quotation per RFQ per vendor)
    existing_q = (
        db.query(Quotation)
        .filter(Quotation.rfq_id == data.rfq_id, Quotation.vendor_id == vendor_id)
        .first()
    )
    if existing_q:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot submit quotation. You have already submitted a quotation for this RFQ.",
        )

    # Calculate Grand Total automatically
    grand_total = calculate_grand_total(data.subtotal, data.tax_percent)

    new_quotation = Quotation(
        rfq_id=data.rfq_id,
        vendor_id=vendor_id,
        subtotal=data.subtotal,
        tax_percent=data.tax_percent,
        grand_total=grand_total,
        delivery_days=data.delivery_days,
        remarks=data.remarks,
        status=data.status,
    )

    db.add(new_quotation)
    db.commit()
    db.refresh(new_quotation)
    return new_quotation


def update_quotation(db: Session, quotation_id: int, data: QuotationUpdate) -> Quotation | None:
    """Update a quotation. Restricts editing after review has started."""
    quotation = get_quotation_by_id(db, quotation_id)
    if not quotation:
        return None

    # Check if review has started (can edit only in DRAFT or SUBMITTED status)
    if quotation.status not in (QuotationStatus.DRAFT, QuotationStatus.SUBMITTED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit quotation once review has started.",
        )

    update_fields = data.model_dump(exclude_unset=True)

    # Calculate grand total if subtotal or tax_percent changes
    subtotal = update_fields.get("subtotal", quotation.subtotal)
    tax_percent = update_fields.get("tax_percent", quotation.tax_percent)
    if "subtotal" in update_fields or "tax_percent" in update_fields:
        update_fields["grand_total"] = calculate_grand_total(subtotal, tax_percent)

    for field, value in update_fields.items():
        setattr(quotation, field, value)

    # If status changes to submitted, update submitted_at
    if update_fields.get("status") == QuotationStatus.SUBMITTED:
        quotation.submitted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(quotation)
    return quotation
