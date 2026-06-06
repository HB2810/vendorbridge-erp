def recommend_best_vendor(quotations: list[dict]) -> dict | None:
    if not quotations:
        return None
    return max(quotations, key=lambda item: item.get("score", 0))

