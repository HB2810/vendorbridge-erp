# VendorBridge Backend

FastAPI backend for the VendorBridge Enterprise Procurement & Sourcing ERP.

## Key Modules & Features

- **Authentication & Authorization**: Role-based access control (RBAC) via JWT tokens.
- **Vendor Directory**: Directory lookup, ratings, and performance logs.
- **RFQ Management**: Creating and dispatching RFQs.
- **Quotation Analysis**: Bidding lists and tax/delivery calculations.
- **Commercial Comparison**: Side-by-side analysis of bids.
- **Approval Workflows**: Multi-stage approvals.
- **POs & Invoices**: Order creation and financial tracking.

---

## Setup & Running the Backend

Always execute backend commands from the `backend/` directory.

### 1. Navigate to the backend directory
From the root of the project:
```bash
cd backend
```

### 2. Set up a virtual environment (if not already done)
```bash
python -m venv .venv
```

### 3. Activate the virtual environment
* **Windows (PowerShell):**
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
* **Windows (Command Prompt):**
  ```cmd
  .\.venv\Scripts\activate.bat
  ```
* **macOS / Linux:**
  ```bash
  source .venv/bin/activate
  ```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Seed the Database
Before logging in, you **must seed the database** to populate the preconfigured user accounts and demo data:
```bash
python seed_db.py
```

### 6. Run the FastAPI Server
```bash
uvicorn app.main:app --reload
```

The Interactive API documentation (Swagger UI) will then be available at:
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Pre-configured Login Credentials
All seeded accounts use the password **`password123`**:

| Role | Email (ID) | Password | Name |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@example.com` | `password123` | System Administrator |
| **Procurement Officer** | `po@example.com` | `password123` | Sarah Jenkins (Officer) |
| **Manager** | `manager@example.com` | `password123` | Marcus Vance (Manager) |
| **Vendor User** | `vendor@example.com` | `password123` | Optima Power (Vendor) |

---

## Project Structure
```text
backend/
  app/
    core/         # Configuration and exception handlers
    database/     # DB connections and session setup
    models/       # SQLAlchemy models (User, Vendor, RFQ, etc.)
    routes/       # API router endpoints
    schemas/      # Pydantic schemas for payload validation
    services/     # Core business logic
    utils/        # Cryptography and security helpers
  requirements.txt
  seed_db.py      # Database seeder script
  vendorbridge.db # SQLite database file (created automatically)
  README.md
```
