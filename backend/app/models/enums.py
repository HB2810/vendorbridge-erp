"""
Status and Role Enum definitions for the VendorBridge ERP database models.
"""

from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    PROCUREMENT_OFFICER = "PROCUREMENT_OFFICER"
    MANAGER = "MANAGER"
    VENDOR = "VENDOR"


class VendorStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class RFQStatus(str, Enum):
    DRAFT = "DRAFT"
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class QuotationStatus(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class ApprovalStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class PurchaseOrderStatus(str, Enum):
    DRAFT = "DRAFT"
    GENERATED = "GENERATED"
    COMPLETED = "COMPLETED"


class InvoiceStatus(str, Enum):
    DRAFT = "DRAFT"
    GENERATED = "GENERATED"
    PAID = "PAID"
    CANCELLED = "CANCELLED"
