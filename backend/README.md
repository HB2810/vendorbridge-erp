# VendorBridge Backend

FastAPI backend scaffold for a hackathon procurement workflow platform.

## Modules

- Authentication and role-based access
- Vendor management
- RFQ creation and quotation handling
- Quotation comparison and recommendation support
- Approval workflow
- Purchase order and invoice tracking
- Activity logs for audit visibility

## Quick Start

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs will be available at:

```text
http://127.0.0.1:8000/docs
```

## Project Structure

```text
backend/
  app/
    core/
    database/
    models/
    routes/
    schemas/
    services/
    utils/
  requirements.txt
  vendorbridge.db
  README.md
```

