# 👋 Welcome to the VendorBridge Backend!

Hello there! This is the backend engine that powers the **VendorBridge Enterprise Procurement & Sourcing ERP**. It's built with FastAPI, making it super fast, reliable, and easy to work with.

Whether you're looking to manage vendors, handle RFQs (Request for Quotations), or track approvals and invoices, this backend has you covered!

---

## 🌟 What Can It Do?

Here are some of the cool features packed into this project:

- **🔐 Authentication & Authorization**: Secure login system with role-based access control (using JWT tokens) so everyone only sees what they're supposed to.
- **🏢 Vendor Directory**: Keep track of all your suppliers, their ratings, and past performance.
- **📝 RFQ Management**: Easily create, manage, and dispatch RFQs to your vendors.
- **📊 Quotation Analysis**: Automatically calculate taxes, delivery times, and organize incoming bids.
- **⚖️ Commercial Comparison**: Compare vendor quotes side-by-side to make the best purchasing decisions.
- **✅ Approval Workflows**: A built-in system for multi-stage management sign-offs.
- **🧾 POs & Invoices**: Generate purchase orders and keep an eye on your finances.

---

## 🚀 Let's Get Started!

Want to run this locally? Just follow these simple steps. 
*(Note: Please make sure you are running these commands from inside the `backend/` directory!)*

### 1. Jump into the backend folder
From the root of your project, type:
```bash
cd backend
```

### 2. Create a virtual environment
This keeps all our dependencies neat and tidy:
```bash
python -m venv .venv
```

### 3. Activate your environment
Depending on your operating system, run one of the following:
* **Windows (PowerShell):** `.\.venv\Scripts\Activate.ps1`
* **Windows (Command Prompt):** `.\.venv\Scripts\activate.bat`
* **macOS / Linux:** `source .venv/bin/activate`

### 4. Install the goodies
Let's grab all the required packages:
```bash
pip install -r requirements.txt
```

### 5. 🌱 Seed the Database
**Important step!** Before you try to log in, you'll want to populate the database with some sample data and pre-configured accounts:
```bash
python seed_db.py
```

### 6. Fire it up! 🔥
Start the server with:
```bash
uvicorn app.main:app --reload
```

That's it! Your API is now happily humming along. You can check out the interactive API documentation (Swagger UI) right here:
👉 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🔑 Demo Accounts

If you seeded the database in Step 5, you can use these handy accounts to test out different features. 

**Pro tip:** They all use the exact same password: **`password123`**!

| Role | Email (Login ID) | Password | Full Name |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@example.com` | `password123` | System Administrator |
| **Procurement Officer** | `po@example.com` | `password123` | Sarah Jenkins (Officer) |
| **Manager** | `manager@example.com` | `password123` | Marcus Vance (Manager) |
| **Vendor User** | `vendor@example.com` | `password123` | Optima Power (Vendor) |

---

## 📂 Project Structure

Curious about how things are organized? Here's a quick map:

```text
backend/
  app/
    core/         # Setup, settings, and error handling
    database/     # Where the DB magic happens
    models/       # Our data structures (User, Vendor, RFQ, etc.)
    routes/       # The API endpoints 
    schemas/      # Pydantic models to keep our data clean and validated
    services/     # The brains of the operation (business logic)
    utils/        # Handy helpers (like password hashing)
  requirements.txt
  seed_db.py      # The script that sets up our demo data
  vendorbridge.db # Your local SQLite database (created automatically!)
  README.md
```

Happy coding! 💻✨
