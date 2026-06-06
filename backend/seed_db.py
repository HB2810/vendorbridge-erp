import sys
from decimal import Decimal
from datetime import datetime, timedelta, timezone

sys.path.append(r"d:\backend\backend")

from app.database.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.enums import UserRole, VendorStatus, RFQStatus, QuotationStatus, ApprovalStatus, PurchaseOrderStatus, InvoiceStatus
from app.models.vendor import Vendor
from app.models.rfq import RFQ
from app.models.rfq_vendor import RFQVendor
from app.models.quotation import Quotation
from app.models.approval import Approval
from app.models.purchase_order import PurchaseOrder
from app.models.invoice import Invoice
from app.utils.security import hash_password

def seed():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding users...")
        pwd_hash = hash_password("password123")
        
        admin = User(name="System Administrator", email="admin@example.com", password_hash=pwd_hash, role=UserRole.ADMIN)
        officer = User(name="Sarah Jenkins (Officer)", email="po@example.com", password_hash=pwd_hash, role=UserRole.PROCUREMENT_OFFICER)
        manager = User(name="Marcus Vance (Manager)", email="manager@example.com", password_hash=pwd_hash, role=UserRole.MANAGER)
        vendor_user = User(name="Optima Power (Vendor)", email="vendor@example.com", password_hash=pwd_hash, role=UserRole.VENDOR)
        
        db.add_all([admin, officer, manager, vendor_user])
        db.commit()

        print("Seeding vendors...")
        v1 = Vendor(vendor_code="VND-001", company_name="Apex Manufacturing Ltd", contact_person="Sarah Jenkins", email="po@example.com", phone="+1 (555) 019-8234", address="Building 4, Sector 7, Chicago, IL", status=VendorStatus.ACTIVE, rating=Decimal("4.80"))
        v2 = Vendor(vendor_code="VND-002", company_name="LogiRoute Global Services", contact_person="Marcus Vance", email="vance.m@logiroute.net", phone="+1 (555) 014-9988", address="Suite 400, LogiPort Hub, Newark, NJ", status=VendorStatus.ACTIVE, rating=Decimal("4.20"))
        v3 = Vendor(vendor_code="VND-003", company_name="CoreTech Solutions Inc", contact_person="Deepak Sharma", email="dsharma@coretech.io", phone="+91 98765 43210", address="Plot 12, Phase 3, Hitec City, India", status=VendorStatus.ACTIVE, rating=Decimal("4.50"))
        v4 = Vendor(vendor_code="VND-004", company_name="Zenith Industrial Supplies", contact_person="Elena Rostova", email="vendor@example.com", phone="+49 89 201934", address="Industriestrasse 14, Munich, Germany", status=VendorStatus.ACTIVE, rating=Decimal("3.90"))
        
        db.add_all([v1, v2, v3, v4])
        db.commit()

        print("Seeding RFQs...")
        rfq1 = RFQ(rfq_number="RFQ-2026-0001", title="Heavy Duty Steel Springs", description="Procurement of heavy duty steel springs for automotive suspension assemblies.", status=RFQStatus.OPEN, deadline=datetime.now(timezone.utc) + timedelta(days=10), created_by=officer.id)
        rfq2 = RFQ(rfq_number="RFQ-2026-0002", title="High Precision CNC Milling Parts", description="Precision CNC milling parts for specialized robotics chassis.", status=RFQStatus.DRAFT, deadline=datetime.now(timezone.utc) + timedelta(days=15), created_by=officer.id)
        rfq3 = RFQ(rfq_number="RFQ-2026-0003", title="Server Rack Assemblies", description="Standard 42U rack assemblies for secondary data center deployment.", status=RFQStatus.CLOSED, deadline=datetime.now(timezone.utc) - timedelta(days=2), created_by=admin.id)
        
        db.add_all([rfq1, rfq2, rfq3])
        db.commit()

        # Link vendors to RFQ1 via RFQVendor junction
        rv1 = RFQVendor(rfq_id=rfq1.id, vendor_id=v1.id)
        rv2 = RFQVendor(rfq_id=rfq1.id, vendor_id=v2.id)
        rv4 = RFQVendor(rfq_id=rfq1.id, vendor_id=v4.id)
        db.add_all([rv1, rv2, rv4])
        db.commit()

        print("Seeding Quotations...")
        q1 = Quotation(rfq_id=rfq1.id, vendor_id=v1.id, subtotal=Decimal("45000.00"), tax_percent=Decimal("18.00"), grand_total=Decimal("53100.00"), delivery_days=10, status=QuotationStatus.SUBMITTED)
        q2 = Quotation(rfq_id=rfq1.id, vendor_id=v2.id, subtotal=Decimal("42000.00"), tax_percent=Decimal("18.00"), grand_total=Decimal("49560.00"), delivery_days=12, status=QuotationStatus.SUBMITTED)
        q3 = Quotation(rfq_id=rfq1.id, vendor_id=v4.id, subtotal=Decimal("48000.00"), tax_percent=Decimal("18.00"), grand_total=Decimal("56640.00"), delivery_days=8, status=QuotationStatus.DRAFT)
        
        db.add_all([q1, q2, q3])
        db.commit()

        print("Seed completed successfully!")
    except Exception as e:
        print("Error during seeding:", e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
