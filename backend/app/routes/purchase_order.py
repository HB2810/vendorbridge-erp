"""
Purchase Order API routes with role-based access control (RBAC).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.models.enums import UserRole
from app.routes.roles import require_role, require_any_role, get_current_user
from app.routes.quotation import get_vendor_by_user
from app.schemas.purchase_order import PurchaseOrderCreate, PurchaseOrderResponse
from app.services import purchase_order_service

router = APIRouter()


@router.post(
    "",
    response_model=PurchaseOrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a Purchase Order from an approved quotation",
)
def create_purchase_order(
    data: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER)),
):
    """
    Create a new Purchase Order from an APPROVED (ACCEPTED) quotation.
    Accessible to PROCUREMENT_OFFICER and ADMIN only.
    """
    return purchase_order_service.create_purchase_order(db, quotation_id=data.quotation_id)


@router.get(
    "",
    response_model=list[PurchaseOrderResponse],
    summary="List purchase orders",
)
def list_purchase_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve purchase orders.
    ADMIN, PROCUREMENT_OFFICER, and MANAGER can view all POs.
    VENDOR users can view POs only for their own vendor profile.
    """
    if current_user.role == UserRole.VENDOR:
        vendor = get_vendor_by_user(db, current_user)
        vendor_id = vendor.id
    else:
        vendor_id = None

    return purchase_order_service.get_purchase_orders(db, vendor_id=vendor_id)


@router.get(
    "/{id}",
    response_model=PurchaseOrderResponse,
    summary="Retrieve purchase order details",
)
def get_purchase_order(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve details of a single purchase order by ID.
    ADMIN, PROCUREMENT_OFFICER, and MANAGER have unrestricted access.
    VENDOR users are restricted to viewing POs belonging to their own profile.
    """
    po = purchase_order_service.get_purchase_order_by_id(db, po_id=id)
    if not po:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Purchase Order with id {id} not found.",
        )

    if current_user.role == UserRole.VENDOR:
        vendor = get_vendor_by_user(db, current_user)
        if po.vendor_id != vendor.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only view your own purchase orders.",
            )

    return po
