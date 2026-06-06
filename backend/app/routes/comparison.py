"""
API routes for Quotation Comparison and Recommendation Engine.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.enums import UserRole
from app.routes.roles import require_any_role
from app.schemas.comparison import QuotationComparisonItem, RecommendationResponse
from app.services import comparison_service

router = APIRouter()


@router.get(
    "/{rfq_id}",
    response_model=list[QuotationComparisonItem],
    summary="Compare quotations for a specific RFQ",
)
def compare_quotations(
    rfq_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER)
    ),
):
    """
    Compare all SUBMITTED quotations for a given RFQ.
    Requires at least 2 submitted quotations.
    Accessible to ADMIN, PROCUREMENT_OFFICER, and MANAGER.
    """
    return comparison_service.compare_quotations(db, rfq_id=rfq_id)


@router.get(
    "/{rfq_id}/recommendation",
    response_model=RecommendationResponse,
    summary="Get vendor recommendation for a specific RFQ",
)
def get_recommendation(
    rfq_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_any_role(UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER, UserRole.MANAGER)
    ),
):
    """
    Generate vendor recommendation based on price score (50%), delivery speed (30%), and vendor rating (20%).
    Requires at least 2 submitted quotations.
    Accessible to ADMIN, PROCUREMENT_OFFICER, and MANAGER.
    """
    return comparison_service.recommend_quotation(db, rfq_id=rfq_id)
