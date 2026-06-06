def is_approval_complete(decisions: list[str]) -> bool:
    return bool(decisions) and all(decision == "approved" for decision in decisions)

