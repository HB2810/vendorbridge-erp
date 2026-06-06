"""
Service layer for Dashboard operations.
"""

from decimal import Decimal
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.models.rfq import RFQ
from app.models.approval import Approval
from app.models.purchase_order import PurchaseOrder
from app.models.invoice import Invoice
from app.models.enums import VendorStatus, RFQStatus, ApprovalStatus, InvoiceStatus


def get_dashboard_stats(db: Session) -> dict:
    """Retrieve aggregate statistics across vendors, RFQs, approvals, POs, and invoices."""
    total_vendors = db.query(func.count(Vendor.id)).scalar() or 0
    active_vendors = db.query(func.count(Vendor.id)).filter(Vendor.status == VendorStatus.ACTIVE).scalar() or 0
    active_rfqs = db.query(func.count(RFQ.id)).filter(RFQ.status == RFQStatus.OPEN).scalar() or 0
    pending_approvals = db.query(func.count(Approval.id)).filter(Approval.status == ApprovalStatus.PENDING).scalar() or 0
    total_purchase_orders = db.query(func.count(PurchaseOrder.id)).scalar() or 0
    total_invoices = db.query(func.count(Invoice.id)).scalar() or 0

    # Calculate total procurement value from generated or paid invoices
    val_sum = db.query(func.sum(Invoice.grand_total)).filter(
        Invoice.status.in_([InvoiceStatus.GENERATED, InvoiceStatus.PAID])
    ).scalar()
    total_procurement_value = Decimal(val_sum) if val_sum is not None else Decimal("0.00")

    return {
        "total_vendors": total_vendors,
        "active_vendors": active_vendors,
        "active_rfqs": active_rfqs,
        "pending_approvals": pending_approvals,
        "total_purchase_orders": total_purchase_orders,
        "total_invoices": total_invoices,
        "total_procurement_value": total_procurement_value.quantize(Decimal("0.01")),
    }
