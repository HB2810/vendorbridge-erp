def calculate_quotation_score(price: float, delivery_days: int) -> float:
    price_score = max(0.0, 100.0 - price / 1000.0)
    delivery_score = max(0.0, 100.0 - delivery_days)
    return round((price_score * 0.7) + (delivery_score * 0.3), 2)

