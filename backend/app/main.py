from fastapi import FastAPI

from app.routes import (
    activity_logs,
    approvals,
    auth,
    comparison,
    dashboard,
    invoices,
    purchase_orders,
    quotations,
    rfqs,
    vendors,
)

app = FastAPI(
    title="VendorBridge API",
    description="Procurement workflow backend for vendor, RFQ, quotation, approval, PO, and invoice management.",
    version="0.1.0",
)


@app.get("/", tags=["Health"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "VendorBridge API"}


app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(vendors.router)
app.include_router(rfqs.router)
app.include_router(quotations.router)
app.include_router(comparison.router)
app.include_router(approvals.router)
app.include_router(purchase_orders.router)
app.include_router(invoices.router)
app.include_router(activity_logs.router)

