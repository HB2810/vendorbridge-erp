import React, { createContext, useState, useContext } from 'react';
import { initialVendors, initialRFQs, initialQuotations, initialApprovals, initialInvoices } from '../data/mockData';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [vendors, setVendors] = useState(initialVendors);
  const [rfqs, setRfqs] = useState(initialRFQs);
  const [quotations, setQuotations] = useState(initialQuotations);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [invoices, setInvoices] = useState(initialInvoices);

  // Vendor handlers
  const addVendor = (vendor) => {
    const newVendor = {
      ...vendor,
      id: `VND-2024-00${vendors.length + 1}`,
      ratingHistory: vendor.ratingHistory || [],
      pastPOs: vendor.pastPOs || []
    };
    setVendors(prev => [newVendor, ...prev]);
    return newVendor;
  };

  const updateVendor = (updated) => {
    setVendors(prev => prev.map(v => v.id === updated.id ? updated : v));
  };

  // RFQ handlers
  const addRFQ = (rfq) => {
    const newRfq = {
      ...rfq,
      id: `RFQ-2024-00${rfqs.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      status: rfq.status || 'Draft'
    };
    setRfqs(prev => [newRfq, ...prev]);
    return newRfq;
  };

  const updateRFQ = (updated) => {
    setRfqs(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  // Quotation handlers
  const addQuotation = (quotation) => {
    const newQuotation = {
      ...quotation,
      id: `QT-2024-00${quotations.length + 1}`,
      submissionDate: new Date().toISOString().split('T')[0]
    };
    setQuotations(prev => [newQuotation, ...prev]);
    return newQuotation;
  };

  const updateQuotationStatus = (id, status) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status } : q));
  };

  // Approval handlers
  const addApproval = (approval) => {
    const newApproval = {
      ...approval,
      id: `APP-2024-00${approvals.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      status: approval.status || 'Pending',
      timeline: approval.timeline || [
        {
          timestamp: new Date().toLocaleString(),
          actor: approval.requestedBy || 'Procurement System',
          state: 'Created',
          comments: approval.remarks || 'Initiated approval process.'
        }
      ]
    };
    setApprovals(prev => [newApproval, ...prev]);
    return newApproval;
  };

  const updateApproval = (id, status, remarks, actorName) => {
    setApprovals(prev => prev.map(app => {
      if (app.id === id) {
        const timestamp = new Date().toLocaleString();
        return {
          ...app,
          status,
          remarks: remarks || app.remarks,
          timeline: [
            ...app.timeline,
            {
              timestamp,
              actor: actorName,
              state: status,
              comments: remarks || `${status} the approval request.`
            }
          ]
        };
      }
      return app;
    }));
  };

  // Invoice handlers
  const addInvoice = (invoice) => {
    const newInvoice = {
      ...invoice,
      invoiceNumber: invoice.invoiceNumber || `INV-2024-00${invoices.length + 1}`,
      poNumber: invoice.poNumber || `PO-2024-00${invoices.length + 50}`
    };
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  return (
    <AppContext.Provider value={{
      vendors,
      rfqs,
      quotations,
      approvals,
      invoices,
      addVendor,
      updateVendor,
      addRFQ,
      updateRFQ,
      addQuotation,
      updateQuotationStatus,
      addApproval,
      updateApproval,
      addInvoice
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
