# 🎉 Welcome to VendorBridge!

**VendorBridge** is your new command center for enterprise procurement and sourcing! 

We've designed this ERP dashboard to be modern, incredibly clean, and high-contrast, making it a joy to use. Say goodbye to clunky, confusing software! VendorBridge streamlines everything from looking up vendors and managing RFQs to analyzing quotations and handling invoices—all in one beautiful package.

---

## ✨ What makes it awesome? (Key Features)

- **🔐 Smooth Auth Portal**: A sleek, modern Login and Register experience. We've added robust client-side checks and suppressed annoying browser autocompletes to keep things looking premium.
- **📈 Command Dashboard**: Your at-a-glance KPI matrix. Quickly track monthly spend, active RFQs, vendor stats, and where things are stuck in the approval pipeline.
- **🏢 Vendor Directory**: Easily search and filter through your suppliers. Keep track of performance histories and profile ratings.
- **📬 RFQ Control Center**: Create and send out Request for Quotations (RFQs) with precise specifications and firm deadlines.
- **📊 Quotation Analysis**: Review bids dynamically. Watch item lists update automatically alongside tax calculations and status changes.
- **⚖️ Commercial Comparison**: Our side-by-side comparison matrix makes it simple to see which vendor quote offers the best commercial value.
- **✅ Approvals Workflow**: Keep things moving with an audited pipeline that maps out multi-stage manager sign-offs.
- **🧾 Invoices & POs**: Your financial control deck! Generate, track, and format Purchase Orders effortlessly.

---

## 🚀 Ready to jump in? (Getting Started)

Let's get this running on your local machine!

### 1. What you'll need first
Make sure you have these installed:
* [Node.js](https://nodejs.org/) (v18.x or above)
* [npm](https://www.npmjs.com/) (v9.x or above)

### 2. Step into the frontend
From the root of your project folder, type:
```bash
cd frontend
```

### 3. Install the magic 📦
Grab all the required dependencies:
```bash
npm install
```

### 4. 🔌 Connect to the Backend
Our frontend needs its backend buddy to work properly! It's pre-configured to look for the FastAPI backend at `http://127.0.0.1:8000`. 
*(If you haven't started the backend yet, take a quick peek at the `backend/README.md` for instructions!)*

### 5. Start the engine! 🏎️
Run the local development server:
```bash
npm run dev
```
Awesome! Now open your favorite browser and head to the link shown in your terminal (usually [http://localhost:5173/](http://localhost:5173/)).

---

## 🔑 Test Drive Accounts

Want to poke around without setting up your own data? As long as you've seeded your backend database, you can use these handy demo accounts (the password for all of them is **`password123`**!):

| Who are you today? | Email (Login ID) | Password | Full Name |
| :--- | :--- | :--- | :--- |
| **The Big Boss** (Admin) | `admin@example.com` | `password123` | System Administrator |
| **The Buyer** (Procurement) | `po@example.com` | `password123` | Sarah Jenkins (Officer) |
| **The Approver** (Manager) | `manager@example.com` | `password123` | Marcus Vance (Manager) |
| **The Supplier** (Vendor) | `vendor@example.com` | `password123` | Optima Power (Vendor) |

---

## 🛠️ Handy Developer Commands
* **Ready for production?** `npm run build`
* **Keep your code clean:** `npm run lint`

Enjoy using VendorBridge! 🚀
