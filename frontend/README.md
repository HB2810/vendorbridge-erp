# VendorBridge — Enterprise Procurement & Sourcing ERP Control Terminal

VendorBridge is a corporate sourcing and procurement ERP dashboard designed with a modern, clean, high-contrast visual interface. It facilitates vendor directory lookup, RFQ management, quotation analysis, approvals, and invoices in a streamlined, premium layout.

---

## Key Modules & Features

- **Auth Portal**: Clean, modern Login and Register modules with robust client-side validator checks, premium ambient background blobs, and browser autocomplete suppression.
- **System Dashboard**: At-a-glance KPI control matrix tracking monthly expenditures, active RFQs, vendor statistics, and approval pipelines.
- **Vendor Directory**: Full search, paginated directory, category filters, and detailed vendor profile ratings/performance history audit logs.
- **RFQ Control Center**: Create and dispatch Request for Quotations (RFQs) with precise item specs and deadline management.
- **Quotation Analysis**: Dynamic bid review with auto-updating item lists, tax calculations, and status states.
- **Commercial Comparison**: Structural comparison matrix to analyze vendor quotes side-by-side on commercial viability.
- **Approvals Workflow**: Audited procurement approval pipeline mapping out multi-stage manager sign-offs.
- **Invoices & POs**: Financial control deck listing PO generation, print formatting, and tracking.

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18.x or above)
* [npm](https://www.npmjs.com/) (v9.x or above)

### 2. Navigate to the frontend directory
From the root of the repository:
```bash
cd frontend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Ensure the Backend is Running
The frontend is pre-configured to communicate with the FastAPI backend at `http://127.0.0.1:8000`. Make sure you have started the backend server (see the backend README for instructions).

### 5. Run the local development server
```bash
npm run dev
```
Open your browser and navigate to the port displayed in the terminal (usually [http://localhost:5173/](http://localhost:5173/)).

---

## Login Credentials
Once the database is seeded, use the following logins to test different roles:

| Role | Email (ID) | Password | Name |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@example.com` | `password123` | System Administrator |
| **Procurement Officer** | `po@example.com` | `password123` | Sarah Jenkins (Officer) |
| **Manager** | `manager@example.com` | `password123` | Marcus Vance (Manager) |
| **Vendor User** | `vendor@example.com` | `password123` | Optima Power (Vendor) |

---

## Project Commands
* **Build production bundle:** `npm run build`
* **Lint code:** `npm run lint`
