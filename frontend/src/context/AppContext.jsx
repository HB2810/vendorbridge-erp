/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import { initialVendors, initialRFQs, initialQuotations, initialApprovals, initialInvoices } from '../data/mockData';
import api from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

const normalizeVendor = (apiVendor) => ({
  id: apiVendor.id,
  vendor_code: apiVendor.vendor_code,
  name: apiVendor.company_name,
  category: apiVendor.category || 'Manufacturing',
  gstNumber: apiVendor.gst_number || '',
  contactPerson: apiVendor.contact_person,
  email: apiVendor.email,
  phone: apiVendor.phone || '',
  address: apiVendor.address || '',
  status: apiVendor.status === 'ACTIVE' ? 'Active' : 'Inactive',
  rating: parseFloat(apiVendor.rating) || 0.0,
  ratingHistory: [],
  pastPOs: []
});

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [rfqs, setRfqs] = useState(initialRFQs);
  const [quotations, setQuotations] = useState(initialQuotations);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [invoices, setInvoices] = useState(initialInvoices);

  const fetchVendors = async () => {
    if (!user) return;
    try {
      const response = await api.get('/api/vendors?size=100');
      const mapped = response.data.items.map(normalizeVendor);
      setVendors(mapped);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVendors();
    } else {
      setVendors([]);
    }
  }, [user]);

  // Vendor handlers
  const addVendor = async (vendor) => {
    try {
      const code = vendor.vendor_code || `VND-${Math.floor(100000 + Math.random() * 900000)}`;
      const payload = {
        vendor_code: code,
        company_name: vendor.name,
        category: vendor.category,
        gst_number: vendor.gstNumber,
        contact_person: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        status: vendor.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
        rating: parseFloat(vendor.rating) || 5.0
      };
      const response = await api.post('/api/vendors', payload);
      const newVnd = normalizeVendor(response.data);
      setVendors(prev => [newVnd, ...prev]);
      return newVnd;
    } catch (error) {
      console.error('Error adding vendor:', error);
      throw error;
    }
  };

  const updateVendor = async (updated) => {
    try {
      const payload = {
        vendor_code: updated.vendor_code,
        company_name: updated.name,
        category: updated.category,
        gst_number: updated.gstNumber,
        contact_person: updated.contactPerson,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
        status: updated.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
        rating: parseFloat(updated.rating) || 5.0
      };
      const response = await api.put(`/api/vendors/${updated.id}`, payload);
      const normalized = normalizeVendor(response.data);
      setVendors(prev => prev.map(v => v.id === updated.id ? normalized : v));
      return normalized;
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
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

  const deleteVendor = async (id) => {
    try {
      await api.delete(`/api/vendors/${id}`);
      setVendors(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
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
      deleteVendor,
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
