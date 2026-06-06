"""
Comparison service layer implementing validation, scoring algorithms, and vendor recommendations.
"""

from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.rfq import RFQ
from app.models.quotation import Quotation
from app.models.enums import QuotationStatus


def get_submitted_quotations(db: Session, rfq_id: int) -> list[Quotation]:
    """Retrieve submitted quotations for an RFQ, validating existence and minimum count constraints."""
    # Check RFQ existence
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"RFQ with id {rfq_id} not found.",
        )

    # Query only submitted quotations
    quotations = (
        db.query(Quotation)
        .filter(Quotation.rfq_id == rfq_id, Quotation.status == QuotationStatus.SUBMITTED)
        .all()
    )

    # Validate minimum of 2 submitted quotations
    if len(quotations) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"At least two submitted quotations are required for comparison. Found {len(quotations)}.",
        )

    return quotations


def compare_quotations(db: Session, rfq_id: int) -> list[dict]:
    """Compare submitted quotations for an RFQ and return details including computed tax amount."""
    quotations = get_submitted_quotations(db, rfq_id)
    comparison_list = []

    for q in quotations:
        # Calculate tax: subtotal * tax_percent / 100
        tax_amount = (q.subtotal * q.tax_percent / Decimal("100.00")).quantize(Decimal("0.01"))
        
        comparison_list.append({
            "vendor_name": q.vendor.company_name,
            "vendor_rating": q.vendor.rating,
            "subtotal": q.subtotal,
            "tax": tax_amount,
            "tax_percent": q.tax_percent,
            "grand_total": q.grand_total,
            "delivery_days": q.delivery_days,
            "status": q.status,
        })

    return comparison_list


def recommend_quotation(db: Session, rfq_id: int) -> dict:
    """Evaluate submitted quotations and recommend the best one based on price, delivery, and vendor rating."""
    quotations = get_submitted_quotations(db, rfq_id)

    min_price = min(q.grand_total for q in quotations)
    min_days = min(q.delivery_days for q in quotations)

    scored_list = []
    for q in quotations:
        # Price Score (50%)
        if q.grand_total > 0:
            price_score = (min_price / q.grand_total) * Decimal("100.00")
        else:
            price_score = Decimal("100.00")

        # Delivery Speed Score (30%)
        if q.delivery_days > 0:
            delivery_score = (Decimal(min_days) / Decimal(q.delivery_days)) * Decimal("100.00")
        else:
            delivery_score = Decimal("100.00")

        # Vendor Rating Score (20%): rating / 5.0 * 100
        rating = q.vendor.rating or Decimal("0.00")
        rating_score = (rating / Decimal("5.00")) * Decimal("100.00")

        # Calculate final weighted score
        final_score = (
            Decimal("0.50") * price_score
            + Decimal("0.30") * delivery_score
            + Decimal("0.20") * rating_score
        )
        
        # Round to nearest integer
        rounded_score = int(final_score.to_integral_value(rounding="ROUND_HALF_UP"))
        scored_list.append((q, rounded_score))

    # Pick quotation with the highest overall score
    best_quote, best_score = max(scored_list, key=lambda x: x[1])

    # Determine recommendation reason
    is_lowest_price = (best_quote.grand_total == min_price)
    is_fastest_delivery = (best_quote.delivery_days == min_days)

    if is_lowest_price and is_fastest_delivery:
        reason = "Lowest price and fastest delivery"
    elif is_lowest_price:
        reason = "Lowest price"
    elif is_fastest_delivery:
        reason = "Fastest delivery"
    else:
        reason = "Highest overall score"

    return {
        "recommended_vendor": best_quote.vendor.company_name,
        "score": best_score,
        "reason": reason,
    }
