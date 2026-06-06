// mockData.js

export const initialVendors = [
  {
    id: "VND-2024-001",
    name: "Apex Manufacturing Ltd",
    category: "Manufacturing",
    gstNumber: "27AAPCA1234F1Z0",
    contactPerson: "Sarah Jenkins",
    email: "s.jenkins@apex-mfg.com",
    phone: "+1 (555) 019-8234",
    address: "Building 4, Sector 7, Industrial Area, Chicago, IL",
    status: "Active",
    rating: 4.8,
    ratingHistory: [
      { date: "2024-01-10", rating: 4.5, comment: "Initial evaluation" },
      { date: "2024-03-15", rating: 4.7, comment: "On-time delivery performance improved" },
      { date: "2024-05-20", rating: 4.8, comment: "Excellent quality standards maintained" }
    ],
    pastPOs: [
      { id: "PO-2024-0012", title: "Raw Steel Supply", amount: 45000, status: "Delivered", date: "2024-02-14" },
      { id: "PO-2024-0045", title: "Heavy Stamping Parts", amount: 128000, status: "Delivered", date: "2024-04-03" }
    ]
  },
  {
    id: "VND-2024-002",
    name: "LogiRoute Global Services",
    category: "Logistics",
    gstNumber: "27AABCL9876C2Z3",
    contactPerson: "Marcus Vance",
    email: "vance.m@logiroute.net",
    phone: "+1 (555) 014-9988",
    address: "Suite 400, LogiPort Hub, Newark, NJ",
    status: "Active",
    rating: 4.2,
    ratingHistory: [
      { date: "2024-01-12", rating: 4.0, comment: "Route mapping issues resolved" },
      { date: "2024-04-18", rating: 4.2, comment: "SLA compliance met consistently" }
    ],
    pastPOs: [
      { id: "PO-2024-0008", title: "Freight Forwarding Q1", amount: 35000, status: "Delivered", date: "2024-01-20" },
      { id: "PO-2024-0062", title: "Ocean Freight Shipment", amount: 89000, status: "In-Transit", date: "2024-05-11" }
    ]
  },
  {
    id: "VND-2024-003",
    name: "CoreTech Solutions Inc",
    category: "IT Support",
    gstNumber: "27AAECK4567M1Z4",
    contactPerson: "Deepak Sharma",
    email: "dsharma@coretech.io",
    phone: "+91 98765 43210",
    address: "Plot 12, Phase 3, Hitec City, Hyderabad, India",
    status: "Active",
    rating: 4.5,
    ratingHistory: [
      { date: "2024-02-05", rating: 4.3, comment: "System implementation onboarded" },
      { date: "2024-05-12", rating: 4.5, comment: "Exceptional bug fix turnaround times" }
    ],
    pastPOs: [
      { id: "PO-2024-0024", title: "SaaS Dev License Setup", amount: 12000, status: "Completed", date: "2024-03-01" }
    ]
  },
  {
    id: "VND-2024-004",
    name: "Zenith Industrial Supplies",
    category: "Manufacturing",
    gstNumber: "27AAXZN3490G5Z1",
    contactPerson: "Elena Rostova",
    email: "e.rostova@zenith-ind.com",
    phone: "+49 89 201934",
    address: "Industriestrasse 14, Munich, Germany",
    status: "Active",
    rating: 3.9,
    ratingHistory: [
      { date: "2024-02-28", rating: 4.1, comment: "Good quality goods" },
      { date: "2024-05-02", rating: 3.9, comment: "Minor delays in last tooling consignment" }
    ],
    pastPOs: [
      { id: "PO-2024-0019", title: "Precision Tooling", amount: 62000, status: "Delivered", date: "2024-02-22" }
    ]
  },
  {
    id: "VND-2024-005",
    name: "OmniCorp Logistics",
    category: "Logistics",
    gstNumber: "27AAZOC7891P1ZE",
    contactPerson: "Thomas Wright",
    email: "t.wright@omnicorp-log.com",
    phone: "+1 (555) 018-7261",
    address: "Warehouse Block C, Port Road, Savannah, GA",
    status: "Inactive",
    rating: 3.5,
    ratingHistory: [
      { date: "2024-01-20", rating: 3.8, comment: "High initial pricing quotation" },
      { date: "2024-04-10", rating: 3.5, comment: "Missed scheduled slot twice" }
    ],
    pastPOs: []
  },
  {
    id: "VND-2024-006",
    name: "Vanguard Tech Systems",
    category: "IT Support",
    gstNumber: "27AABCV8234D2ZK",
    contactPerson: "Amir Khan",
    email: "amir.k@vanguard-tech.com",
    phone: "+1 (555) 012-7635",
    address: "44 Skyview Plaza, Seattle, WA",
    status: "Active",
    rating: 4.7,
    ratingHistory: [
      { date: "2024-03-01", rating: 4.6, comment: "Secure framework migration completed successfully" },
      { date: "2024-05-30", rating: 4.7, comment: "Consistent 24/7 uptime support" }
    ],
    pastPOs: [
      { id: "PO-2024-0033", title: "Enterprise Database Upgrades", amount: 95000, status: "Completed", date: "2024-03-24" }
    ]
  },
  {
    id: "VND-2024-007",
    name: "Delta Heavy Equipment",
    category: "Manufacturing",
    gstNumber: "27AADHE1425H1ZA",
    contactPerson: "Kurt Wagner",
    email: "k.wagner@delta-equip.com",
    phone: "+1 (555) 016-1212",
    address: "Industrial Complex East, Detroit, MI",
    status: "Active",
    rating: 4.4,
    ratingHistory: [
      { date: "2024-02-15", rating: 4.4, comment: "Good heavy machining capabilities" }
    ],
    pastPOs: [
      { id: "PO-2024-0005", title: "Machining Lathe Setup", amount: 154000, status: "Delivered", date: "2024-01-15" }
    ]
  },
  {
    id: "VND-2024-008",
    name: "Optima Power Solutions",
    category: "Manufacturing",
    gstNumber: "27AAOPS6789D1ZC",
    contactPerson: "Jane Doe",
    email: "j.doe@optimapower.com",
    phone: "+1 (555) 011-8844",
    address: "100 Gridway Road, Austin, TX",
    status: "Active",
    rating: 4.6,
    ratingHistory: [
      { date: "2024-04-01", rating: 4.6, comment: "Initial supplier audit passed" }
    ],
    pastPOs: []
  }
];

export const initialRFQs = [
  {
    id: "RFQ-2024-001",
    title: "High-Grade Structural Steel Parts",
    description: "Requesting supply for structural construction sections. Material Grade: ASTM A36. Standard sizing required. Quote must include transport.",
    createdBy: "Sarah Jenkins (Procurement)",
    deadline: "2024-06-20",
    date: "2024-06-01",
    assignedVendors: ["VND-2024-001", "VND-2024-004", "VND-2024-007"],
    status: "Sent",
    items: [
      { name: "H-Beam Columns (ASTM A36)", description: "12 inch depth, 45 lbs/ft, 30ft lengths", qty: 250, unit: "Pcs" },
      { name: "Steel Plates (ASTM A36)", description: "0.5 inch thickness, 4ft x 8ft", qty: 500, unit: "Pcs" },
      { name: "Angle Iron (ASTM A36)", description: "3in x 3in x 1/4in, 20ft lengths", qty: 400, unit: "Pcs" }
    ]
  },
  {
    id: "RFQ-2024-002",
    title: "Enterprise Cloud Hosting & VPN Support",
    description: "Procurement of cloud nodes, secure network tunneling protocols, and 24/7 dedicated support desk SLA setup.",
    createdBy: "Deepak Sharma (IT Admin)",
    deadline: "2024-06-25",
    date: "2024-06-02",
    assignedVendors: ["VND-2024-003", "VND-2024-006"],
    status: "Sent",
    items: [
      { name: "Dedicated Virtual Compute Nodes", description: "16 vCPU, 64GB RAM instance", qty: 12, unit: "Months" },
      { name: "Enterprise VPN Service Tunnel", description: "IPSec tunneling, redundant connections", qty: 2, unit: "Tunnels" },
      { name: "24/7 Priority SLA Support", description: "L3 engineer support response < 15 mins", qty: 1, unit: "Year" }
    ]
  },
  {
    id: "RFQ-2024-003",
    title: "Bulk Logistics Logistics Contract Q3",
    description: "Contracting logistical freight transport for nationwide warehouse replenishments during the upcoming third quarter.",
    createdBy: "Marcus Vance (Logistics Hub)",
    deadline: "2024-06-18",
    date: "2024-06-03",
    assignedVendors: ["VND-2024-002", "VND-2024-005"],
    status: "Draft",
    items: [
      { name: "Standard Dry Van Fleet (FTE)", description: "53ft truck logistics route daily, Midwest", qty: 90, unit: "Days" },
      { name: "LTL Courier Transports", description: "Mixed pallets under 2000 lbs", qty: 150, unit: "Shipments" }
    ]
  },
  {
    id: "RFQ-2024-004",
    title: "High-Capacity Generator Setup",
    description: "Backup power unit procurement and placement logistics at Manufacturing Facility 2.",
    createdBy: "Jane Doe (Operations)",
    deadline: "2024-06-15",
    date: "2024-06-04",
    assignedVendors: ["VND-2024-007", "VND-2024-008"],
    status: "Closed",
    items: [
      { name: "1000kVA Industrial Diesel Generator", description: "Acoustic enclosure, base fuel tank, auto panel", qty: 1, unit: "Unit" }
    ]
  }
];

export const initialQuotations = [
  // Quotations for RFQ-2024-001 (Structural Steel Parts)
  {
    id: "QT-2024-001",
    rfqId: "RFQ-2024-001",
    vendorId: "VND-2024-001",
    vendorName: "Apex Manufacturing Ltd",
    submissionDate: "2024-06-05",
    deliveryTimeline: "15 Days",
    paymentTerms: "Net 30 Days",
    warrantyNotes: "1 year material structure guarantee",
    status: "Submitted",
    taxPercentage: 18,
    items: [
      { name: "H-Beam Columns (ASTM A36)", unitPrice: 220, qty: 250, total: 55000 },
      { name: "Steel Plates (ASTM A36)", unitPrice: 75, qty: 500, total: 37500 },
      { name: "Angle Iron (ASTM A36)", unitPrice: 38, qty: 400, total: 15200 }
    ],
    subtotal: 107700,
    grandTotal: 127086 // 107700 * 1.18
  },
  {
    id: "QT-2024-002",
    rfqId: "RFQ-2024-001",
    vendorId: "VND-2024-004",
    vendorName: "Zenith Industrial Supplies",
    submissionDate: "2024-06-07",
    deliveryTimeline: "25 Days",
    paymentTerms: "Net 45 Days",
    warrantyNotes: "Manufacturer standard structural warranty",
    status: "Submitted",
    taxPercentage: 18,
    items: [
      { name: "H-Beam Columns (ASTM A36)", unitPrice: 210, qty: 250, total: 52500 },
      { name: "Steel Plates (ASTM A36)", unitPrice: 80, qty: 500, total: 40000 },
      { name: "Angle Iron (ASTM A36)", unitPrice: 42, qty: 400, total: 16800 }
    ],
    subtotal: 109300,
    grandTotal: 128974 // 109300 * 1.18
  },
  {
    id: "QT-2024-003",
    rfqId: "RFQ-2024-001",
    vendorId: "VND-2024-007",
    vendorName: "Delta Heavy Equipment",
    submissionDate: "2024-06-06",
    deliveryTimeline: "12 Days",
    paymentTerms: "Net 15 Days",
    warrantyNotes: "Limited lifetime structural defect coverage",
    status: "Submitted",
    taxPercentage: 18,
    items: [
      { name: "H-Beam Columns (ASTM A36)", unitPrice: 235, qty: 250, total: 58750 },
      { name: "Steel Plates (ASTM A36)", unitPrice: 70, qty: 500, total: 35000 },
      { name: "Angle Iron (ASTM A36)", unitPrice: 35, qty: 400, total: 14000 }
    ],
    subtotal: 107750,
    grandTotal: 127145 // 107750 * 1.18
  },

  // Quotations for RFQ-2024-002 (Enterprise Cloud Hosting & VPN Support)
  {
    id: "QT-2024-004",
    rfqId: "RFQ-2024-002",
    vendorId: "VND-2024-003",
    vendorName: "CoreTech Solutions Inc",
    submissionDate: "2024-06-08",
    deliveryTimeline: "7 Days",
    paymentTerms: "Net 30 Days (Recurring)",
    warrantyNotes: "99.9% availability SLA guarantee",
    status: "Submitted",
    taxPercentage: 12,
    items: [
      { name: "Dedicated Virtual Compute Nodes", unitPrice: 200, qty: 12, total: 2400 },
      { name: "Enterprise VPN Service Tunnel", unitPrice: 150, qty: 2, total: 300 },
      { name: "24/7 Priority SLA Support", unitPrice: 1200, qty: 1, total: 1200 }
    ],
    subtotal: 3900,
    grandTotal: 4368 // 3900 * 1.12
  },
  {
    id: "QT-2024-005",
    rfqId: "RFQ-2024-002",
    vendorId: "VND-2024-006",
    vendorName: "Vanguard Tech Systems",
    submissionDate: "2024-06-09",
    deliveryTimeline: "3 Days",
    paymentTerms: "Net 15 Days",
    warrantyNotes: "99.99% availability SLA guarantee",
    status: "Submitted",
    taxPercentage: 12,
    items: [
      { name: "Dedicated Virtual Compute Nodes", unitPrice: 180, qty: 12, total: 2160 },
      { name: "Enterprise VPN Service Tunnel", unitPrice: 120, qty: 2, total: 240 },
      { name: "24/7 Priority SLA Support", unitPrice: 1500, qty: 1, total: 1500 }
    ],
    subtotal: 3900,
    grandTotal: 4368
  },

  // Closed/Quotation for RFQ-2024-004
  {
    id: "QT-2024-006",
    rfqId: "RFQ-2024-004",
    vendorId: "VND-2024-008",
    vendorName: "Optima Power Solutions",
    submissionDate: "2024-06-05",
    deliveryTimeline: "30 Days",
    paymentTerms: "50% advance, 50% on installation",
    warrantyNotes: "2 year engine machinery warranty",
    status: "Accepted",
    taxPercentage: 18,
    items: [
      { name: "1000kVA Industrial Diesel Generator", unitPrice: 85000, qty: 1, total: 85000 }
    ],
    subtotal: 85000,
    grandTotal: 100300 // 85000 * 1.18
  }
];

export const initialApprovals = [
  {
    id: "APP-2024-001",
    poReference: "PO-2024-0051",
    rfqId: "RFQ-2024-004",
    rfqTitle: "High-Capacity Generator Setup",
    vendorName: "Optima Power Solutions",
    amount: 100300,
    requestedBy: "Jane Doe (Operations)",
    date: "2024-06-05",
    status: "Approved",
    remarks: "Crucial backup power capacity required for Mfg Unit 2 expansion. Pricing justified based on 2-yr warranty.",
    timeline: [
      { timestamp: "2024-06-05 10:15:00", actor: "Jane Doe", state: "Created", comments: "Submitting accepted quotation for approval." },
      { timestamp: "2024-06-05 14:30:00", actor: "Marcus Vance (Manager)", state: "Approved", comments: "Approved. Critical infrastructure requirement." }
    ]
  },
  {
    id: "APP-2024-002",
    poReference: "PO-2024-0052",
    rfqId: "RFQ-2024-001",
    rfqTitle: "High-Grade Structural Steel Parts",
    vendorName: "Apex Manufacturing Ltd",
    amount: 127086,
    requestedBy: "Sarah Jenkins (Procurement)",
    date: "2024-06-06",
    status: "Pending",
    remarks: "",
    timeline: [
      { timestamp: "2024-06-06 09:12:00", actor: "Sarah Jenkins", state: "Created", comments: "Quotation evaluated as best overall price-to-delivery index. Initiating approval workflow." }
    ]
  }
];

export const initialInvoices = [
  {
    invoiceNumber: "INV-2024-001",
    poNumber: "PO-2024-0051",
    vendorId: "VND-2024-008",
    vendorName: "Optima Power Solutions",
    billTo: "VendorBridge Industries Ltd, Corporate Hub, Tower C, NY 10001",
    items: [
      { name: "1000kVA Industrial Diesel Generator", description: "Acoustic enclosure, base fuel tank, auto panel", qty: 1, unitPrice: 85000, total: 85000 }
    ],
    subtotal: 85000,
    taxPercentage: 18,
    taxAmount: 15300,
    grandTotal: 100300,
    paymentTerms: "50% advance, 50% on installation",
    dueDate: "2024-07-05",
    notes: "Delivery expected by June 30. Pre-installation site checks completed."
  }
];
