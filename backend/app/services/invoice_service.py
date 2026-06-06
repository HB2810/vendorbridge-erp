def validate_invoice_amount(invoice_amount: float, po_amount: float) -> bool:
    return 0 <= invoice_amount <= po_amount

