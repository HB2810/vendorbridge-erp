"""
Service layer for Invoice operations.
"""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.invoice import Invoice
from app.models.purchase_order import PurchaseOrder
from app.models.enums import InvoiceStatus
from app.schemas.invoice import InvoiceCreate


def get_invoices(db: Session, vendor_id: int | None = None) -> list[Invoice]:
    """Retrieve all invoices, optionally filtered by vendor ID for ownership isolation."""
    query = db.query(Invoice)
    if vendor_id is not None:
        query = query.join(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor_id)
    return query.order_by(Invoice.id.desc()).all()


def get_invoice_by_id(db: Session, invoice_id: int) -> Invoice | None:
    """Retrieve a single invoice by ID."""
    return db.query(Invoice).filter(Invoice.id == invoice_id).first()


def create_invoice(db: Session, data: InvoiceCreate) -> Invoice:
    """Generate an Invoice from a valid Purchase Order."""
    # Check PO existence
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == data.purchase_order_id).first()
    if not po:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Purchase Order with id {data.purchase_order_id} not found.",
        )

    # Check for duplicate Invoice for the same Purchase Order
    existing_inv = db.query(Invoice).filter(Invoice.purchase_order_id == data.purchase_order_id).first()
    if existing_inv:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An Invoice already exists for Purchase Order id {data.purchase_order_id}.",
        )

    # Set and validate due_date
    if data.due_date:
        due_date = data.due_date
        # Check if due_date is in the future
        # Handle offset-naive/aware datetimes properly
        if due_date.tzinfo is None:
            now = datetime.now(timezone.utc).replace(tzinfo=None)
        else:
            now = datetime.now(timezone.utc)
        if due_date <= now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invoice due date must be in the future.",
            )
    else:
        due_date = datetime.now(timezone.utc) + timedelta(days=30)

    # Calculate subtotal, tax, and grand_total from PO's quotation
    quotation = po.quotation
    subtotal = quotation.subtotal
    tax_percent = quotation.tax_percent
    tax_amount = (subtotal * tax_percent / Decimal("100.00")).quantize(Decimal("0.01"))
    grand_total = quotation.grand_total

    # Auto-generate unique Invoice number (format: INV-2026-0001)
    count = db.query(Invoice).count()
    serial = count + 1
    while True:
        inv_num = f"INV-2026-{serial:04d}"
        if not db.query(Invoice).filter(Invoice.invoice_number == inv_num).first():
            break
        serial += 1

    # Create Invoice
    invoice = Invoice(
        invoice_number=inv_num,
        purchase_order_id=data.purchase_order_id,
        subtotal=subtotal,
        tax=tax_amount,
        grand_total=grand_total,
        payment_terms=data.payment_terms,
        due_date=due_date,
        status=InvoiceStatus.GENERATED,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice
