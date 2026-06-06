"""
Invoice API routes with role-based access control (RBAC).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.models.enums import UserRole
from app.routes.roles import require_role, require_any_role, get_current_user
from app.routes.quotation import get_vendor_by_user
from app.schemas.invoice import InvoiceCreate, InvoiceResponse
from app.services import invoice_service

router = APIRouter()


@router.post(
    "",
    response_model=InvoiceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate an Invoice from a Purchase Order",
)
def create_invoice(
    data: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)),
):
    """
    Create a new Invoice from an existing Purchase Order.
    Accessible to PROCUREMENT_OFFICER and ADMIN only.
    """
    return invoice_service.create_invoice(db, data=data)


@router.get(
    "",
    response_model=list[InvoiceResponse],
    summary="List invoices",
)
def list_invoices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve invoices.
    ADMIN, PROCUREMENT_OFFICER, and MANAGER can view all invoices.
    VENDOR users can view invoices only for their own vendor profile.
    """
    if current_user.role == UserRole.VENDOR:
        vendor = get_vendor_by_user(db, current_user)
        vendor_id = vendor.id
    else:
        vendor_id = None

    return invoice_service.get_invoices(db, vendor_id=vendor_id)


@router.get(
    "/{id}",
    response_model=InvoiceResponse,
    summary="Retrieve invoice details",
)
def get_invoice(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve details of a single invoice by ID.
    ADMIN, PROCUREMENT_OFFICER, and MANAGER have unrestricted access.
    VENDOR users are restricted to viewing invoices belonging to their own profile.
    """
    invoice = invoice_service.get_invoice_by_id(db, invoice_id=id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with id {id} not found.",
        )

    if current_user.role == UserRole.VENDOR:
        vendor = get_vendor_by_user(db, current_user)
        if invoice.purchase_order.vendor_id != vendor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only view your own invoices.",
            )

    return invoice
