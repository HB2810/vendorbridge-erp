"""
Status and Role Enum definitions for the VendorBridge ERP database models.
"""

from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    BUYER = "buyer"
    APPROVER = "approver"
    VIEWER = "viewer"


class VendorStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    BLOCKED = "blocked"


class RFQStatus(str, Enum):
    DRAFT = "draft"
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class QuotationStatus(str, Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class PurchaseOrderStatus(str, Enum):
    DRAFT = "draft"
    ISSUED = "issued"
    ACKNOWLEDGED = "acknowledged"
    DELIVERED = "delivered"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    PAID = "paid"
    VOID = "void"
