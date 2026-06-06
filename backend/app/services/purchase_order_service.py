"""
Service layer for Purchase Order operations.
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.purchase_order import PurchaseOrder
from app.models.quotation import Quotation
from app.models.enums import PurchaseOrderStatus, QuotationStatus


def get_purchase_orders(db: Session, vendor_id: int | None = None) -> list[PurchaseOrder]:
    """Retrieve all purchase orders, optionally filtered by vendor ID for ownership isolation."""
    query = db.query(PurchaseOrder)
    if vendor_id is not None:
        query = query.filter(PurchaseOrder.vendor_id == vendor_id)
    return query.order_by(PurchaseOrder.id.desc()).all()


def get_purchase_order_by_id(db: Session, po_id: int) -> PurchaseOrder | None:
    """Retrieve a single purchase order by ID."""
    return db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()


def create_purchase_order(db: Session, quotation_id: int) -> PurchaseOrder:
    """Generate a Purchase Order from an APPROVED quotation."""
    # Check quotation existence
    quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not quotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quotation with id {quotation_id} not found.",
        )

    # Check that quotation is approved (status == ACCEPTED)
    if quotation.status != QuotationStatus.ACCEPTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot generate Purchase Order. Quotation is in '{quotation.status.value}' status, not APPROVED (ACCEPTED).",
        )

    # Check for duplicate Purchase Order for the same quotation
    existing_po = db.query(PurchaseOrder).filter(PurchaseOrder.quotation_id == quotation_id).first()
    if existing_po:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A Purchase Order already exists for quotation id {quotation_id}.",
        )

    # Auto-generate unique PO number (format: PO-2026-0001)
    count = db.query(PurchaseOrder).count()
    serial = count + 1
    while True:
        po_num = f"PO-2026-{serial:04d}"
        if not db.query(PurchaseOrder).filter(PurchaseOrder.po_number == po_num).first():
            break
        serial += 1

    # Create PO
    po = PurchaseOrder(
        po_number=po_num,
        quotation_id=quotation_id,
        vendor_id=quotation.vendor_id,
        status=PurchaseOrderStatus.GENERATED,
    )
    db.add(po)
    db.commit()
    db.refresh(po)
    return po
