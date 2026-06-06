/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
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

const normalizeRFQ = (apiRfq) => ({
  id: apiRfq.id,
  rfq_number: apiRfq.rfq_number,
  title: apiRfq.title,
  description: apiRfq.description || '',
  category: apiRfq.category || '',
  deadline: apiRfq.deadline ? apiRfq.deadline.split('T')[0] : '',
  status: apiRfq.status === 'OPEN' ? 'Sent' : apiRfq.status === 'CLOSED' ? 'Closed' : 'Draft',
  date: apiRfq.created_at ? apiRfq.created_at.split('T')[0] : '',
  createdBy: `User #${apiRfq.created_by}`,
  items: (apiRfq.items || []).map(item => ({
    id: item.id,
    name: item.item_name,
    description: item.description || '',
    qty: parseFloat(item.quantity) || 0,
    unit: item.unit || 'Pcs'
  })),
  assignedVendors: []
});

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [approvals, setApprovals] = useState([]);

  const fetchVendors = async () => {
    if (!user) return [];
    try {
      const response = await api.get('/api/vendors?size=100');
      const mapped = response.data.items.map(normalizeVendor);
      setVendors(mapped);
      return mapped;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }
  };

  const fetchRFQs = async () => {
    if (!user) return [];
    try {
      const response = await api.get('/api/rfqs?size=100');
      const mapped = response.data.items.map(normalizeRFQ);
      setRfqs(mapped);
      return mapped;
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      return [];
    }
  };

  const fetchApprovals = async (currentRfqs = rfqs, currentVendors = vendors) => {
    if (!user) return;
    try {
      const [appRes, quotRes] = await Promise.all([
        api.get('/api/approvals'),
        api.get('/api/quotations?size=100')
      ]);

      const rfqMap = {};
      currentRfqs.forEach(r => rfqMap[r.id] = r);

      const quotMap = {};
      quotRes.data.items.forEach(q => quotMap[q.id] = q);

      const mapped = appRes.data.map(app => {
        const q = quotMap[app.quotation_id];
        const r = q ? rfqMap[q.rfq_id] : null;
        const v = q ? currentVendors.find(v => v.id === q.vendor_id) : null;
        
        return {
          id: app.id,
          quotation_id: app.quotation_id,
          poReference: `REQ-${app.quotation_id}`,
          vendorName: v ? v.name : `Vendor #${q?.vendor_id}`,
          vendorId: q?.vendor_id,
          date: app.created_at ? app.created_at.split('T')[0] : '',
          rfqTitle: r ? r.title : 'Procurement Sourcing',
          requestedBy: `User #${r?.created_by || 'System'}`,
          amount: q ? parseFloat(q.grand_total) : 0,
          status: app.status === 'APPROVED' ? 'Approved' : app.status === 'REJECTED' ? 'Rejected' : 'Pending',
          remarks: app.remarks,
          timeline: [
            { state: 'Created', timestamp: app.created_at, actor: 'System', comments: 'Approval workflow initiated' },
            app.approved_at ? { 
              state: app.status === 'APPROVED' ? 'Approved' : 'Rejected', 
              timestamp: app.approved_at, 
              actor: `Manager #${app.approved_by}`, 
              comments: app.remarks 
            } : null
          ].filter(Boolean)
        };
      });
      setApprovals(mapped);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  };

  useEffect(() => {
    const initData = async () => {
      if (user) {
        const fetchedVendors = await fetchVendors();
        const fetchedRfqs = await fetchRFQs();
        await fetchApprovals(fetchedRfqs, fetchedVendors);
      } else {
        setVendors([]);
        setRfqs([]);
        setApprovals([]);
      }
    };
    initData();
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

  const deleteVendor = async (id) => {
    try {
      await api.delete(`/api/vendors/${id}`);
      setVendors(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  };

  const updateApproval = async (id, status, remarks, actor) => {
    const approvalObj = approvals.find(a => a.id === id);
    if (!approvalObj) {
      console.error('Approval object not found for id:', id);
      return;
    }
    const quotationId = approvalObj.quotation_id;
    const endpoint = status === 'Approved' ? 'approve' : 'reject';
    try {
      await api.post(`/api/approvals/${quotationId}/${endpoint}`, {
        remarks: remarks || `${status} the request.`
      });
      await fetchApprovals(rfqs, vendors);
    } catch (error) {
      console.error(`Error updating approval for quotation ${quotationId}:`, error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      vendors,
      rfqs,
      approvals,
      addVendor,
      updateVendor,
      deleteVendor,
      updateApproval
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
