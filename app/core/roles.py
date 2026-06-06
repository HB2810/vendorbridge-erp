from enum import StrEnum


class UserRole(StrEnum):
    admin = "admin"
    procurement_manager = "procurement_manager"
    finance = "finance"
    vendor = "vendor"
    viewer = "viewer"


APPROVAL_ROLES = {UserRole.admin, UserRole.procurement_manager, UserRole.finance}

