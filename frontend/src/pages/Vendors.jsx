import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Search, Plus, Star, X, Eye, Edit2, 
  ToggleLeft, ToggleRight, Phone, Mail, MapPin, 
  FileText, ShieldCheck, DollarSign, Calendar
} from 'lucide-react';

const Vendors = () => {
  const { vendors, addVendor, updateVendor } = useApp();
  const { user } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Active, Inactive
  const [categoryFilter, setCategoryFilter] = useState('All'); // All, Manufacturing, Logistics, IT Support, etc.

  // Modal and Drawer states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Manufacturing',
    gstNumber: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
    rating: 5.0
  });

  const [editMode, setEditMode] = useState(false);
  const [editVendorId, setEditVendorId] = useState(null);

  // Categories list derived from current vendors
  const categories = ['All', ...new Set(vendors.map(v => v.category))];

  const handleOpenAddModal = () => {
    setEditMode(false);
    setFormData({
      name: '',
      category: 'Manufacturing',
      gstNumber: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      status: 'Active',
      rating: 5.0
    });
    setIsModalOpen(true);
  };

  // Open modal if URL query specifies it
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openAdd') === 'true') {
      setTimeout(() => {
        handleOpenAddModal();
      }, 0);
    }
  }, [location]);

  const handleOpenEditModal = (vendor, e) => {
    e.stopPropagation(); // Prevent opening the side drawer
    setEditMode(true);
    setEditVendorId(vendor.id);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      gstNumber: vendor.gstNumber,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      status: vendor.status,
      rating: vendor.rating
    });
    setIsModalOpen(true);
  };

  const handleOpenDrawer = (vendor) => {
    setSelectedVendor(vendor);
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = async (vendor, e) => {
    e.stopPropagation();
    const newStatus = vendor.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateVendor({
        ...vendor,
        status: newStatus
      });
      addToast(`Vendor status set to ${newStatus} for ${vendor.name}`, 'info');
    } catch (err) {
      addToast('Failed to update vendor status.', 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name || !formData.contactPerson || !formData.email) {
      addToast('Error: Please populate all required fields.', 'error');
      return;
    }

    try {
      if (editMode) {
        const originalVendor = vendors.find(v => v.id === editVendorId);
        await updateVendor({
          ...originalVendor,
          ...formData
        });
        addToast(`Updated vendor profile: ${formData.name}`, 'success');
      } else {
        const newVnd = await addVendor(formData);
        addToast(`Registered new vendor profile: ${formData.name}`, 'success');
        setSelectedVendor(newVnd);
      }
      setIsModalOpen(false);
    } catch (err) {
      addToast('Failed to save vendor. Check form data.', 'error');
    }
  };

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (vendor.name || '').toLowerCase().includes(q) ||
      String(vendor.vendor_code || vendor.id).toLowerCase().includes(q) ||
      (vendor.gstNumber || '').toLowerCase().includes(q) ||
      (vendor.contactPerson || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' || vendor.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || vendor.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-8rem)]">
      
      {/* Top Filter and Search Action bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-slate-surface p-4 rounded border border-slate-700">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendor, GST number, contact name..."
            className="w-full pl-9 pr-4 py-1.5"
          />
        </div>

        {/* Action Button */}
        {user?.role !== 'vendor' && (
          <button
            onClick={handleOpenAddModal}
            className="bg-indigo-brand hover:bg-indigo-700 text-white font-mono text-xs uppercase font-medium px-4 py-2 rounded flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        )}

      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-mono font-medium text-slate-500 uppercase mr-2">Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 text-xs font-mono border rounded transition-all ${
              categoryFilter === cat 
                ? 'bg-indigo-950 border-indigo-brand text-indigo-400 font-semibold' 
                : 'bg-[#0E1527] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}

        <span className="text-xs font-mono font-medium text-slate-500 uppercase ml-4 mr-2">Status:</span>
        {['All', 'Active', 'Inactive'].map((stat) => (
          <button
            key={stat}
            onClick={() => setStatusFilter(stat)}
            className={`px-3 py-1 text-xs font-mono border rounded transition-all ${
              statusFilter === stat
                ? 'bg-indigo-950 border-indigo-brand text-indigo-400 font-semibold'
                : 'bg-[#0E1527] border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            {stat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Vendor Table */}
      <div className="bg-slate-surface border border-slate-700 rounded shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Company Name</th>
                <th>Category</th>
                <th>GST Number</th>
                <th>Contact</th>
                <th>Rating</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500 font-mono text-xs">
                    NO RECORD MATCHES THE GIVEN FILTER PARAMETERS
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr 
                    key={vendor.id} 
                    onClick={() => handleOpenDrawer(vendor)}
                    className="cursor-pointer"
                  >
                    <td className="font-mono text-xs text-indigo-400 font-bold">{vendor.vendor_code || vendor.id}</td>
                    <td className="font-semibold text-slate-100">{vendor.name}</td>
                    <td><span className="font-mono text-xs">{vendor.category}</span></td>
                    <td className="font-mono text-xs">{vendor.gstNumber}</td>
                    <td>
                      <div className="text-xs">
                        <p className="font-medium text-slate-200">{vendor.contactPerson}</p>
                        <p className="text-slate-500 font-mono scale-95 origin-left">{vendor.email}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-0.5 text-amber-warning">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-mono text-xs text-white font-medium">{vendor.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-status ${
                        vendor.status === 'Active' 
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
                          : 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()} className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenDrawer(vendor)}
                          className="p-1 hover:text-white text-slate-400 hover:bg-[#1E2640] rounded transition-colors"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user?.role !== 'vendor' && (
                          <>
                            <button
                              onClick={(e) => handleOpenEditModal(vendor, e)}
                              className="p-1 hover:text-white text-slate-400 hover:bg-[#1E2640] rounded transition-colors"
                              title="Edit Vendor"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleToggleStatus(vendor, e)}
                              className="p-1 hover:text-white text-slate-400 hover:bg-[#1E2640] rounded transition-colors"
                              title={vendor.status === 'Active' ? 'Deactivate Vendor' : 'Activate Vendor'}
                            >
                              {vendor.status === 'Active' ? (
                                <ToggleRight className="w-5 h-5 text-indigo-400" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-slate-500" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#121A30] border border-slate-700 rounded-lg shadow-2xl p-6 font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                {editMode ? `EDIT VENDOR PROFILE: ${editVendorId}` : 'ADD NEW COMMERCIAL SUPPLIER'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Company Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full"
                    placeholder="e.g. Apex Industrial Solutions Ltd"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Category Sourcing *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full"
                  >
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Logistics">Logistics</option>
                    <option value="IT Support">IT Support</option>
                    <option value="Consultancy">Consultancy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">GST/Registration Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full font-mono text-xs"
                    placeholder="e.g. 27AAPCA1234F1Z0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full"
                    placeholder="First Last Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Business Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full"
                    placeholder="sourcing@company.com"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Office Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows="2"
                    className="w-full text-xs"
                    placeholder="Physical HQ or Warehouse address"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Supplier Initial Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })}
                    className="w-full font-mono text-xs"
                  />
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <span className="text-xs font-mono text-slate-400 uppercase">Status Active</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active' })}
                    className="focus:outline-none"
                  >
                    {formData.status === 'Active' ? (
                      <ToggleRight className="w-8 h-8 text-indigo-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-slate-400 hover:text-white font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-brand hover:bg-indigo-700 text-white font-mono text-xs uppercase rounded"
                >
                  {editMode ? 'Save Changes' : 'Register Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-in Drawer (from right) */}
      {isDrawerOpen && selectedVendor && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          ></div>
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md md:max-w-lg bg-[#0E1527] border-l border-slate-700 shadow-2xl p-6 font-sans overflow-y-auto animate-slide-left">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
              <div>
                <span className="font-mono text-xs text-indigo-400 font-bold">{selectedVendor.vendor_code || selectedVendor.id}</span>
                <h3 className="text-base font-bold text-white uppercase tracking-tight mt-0.5">{selectedVendor.name}</h3>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-[#1E2640] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="space-y-6">
              
              <div className="bg-[#121A30] border border-slate-800 rounded p-4 space-y-3">
                <span className="block text-xs font-mono font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-1.5">Supplier Profile Info</span>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Category</span>
                    <span className="font-semibold text-slate-200">{selectedVendor.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">GST Reg No</span>
                    <span className="font-mono text-slate-200">{selectedVendor.gstNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Sourcing Status</span>
                    <span className={`inline-block scale-90 origin-left badge-status ${
                      selectedVendor.status === 'Active' 
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
                        : 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                    }`}>
                      {selectedVendor.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Overall Quality Score</span>
                    <div className="flex items-center gap-1 text-amber-warning font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-mono text-white">{selectedVendor.rating.toFixed(1)} / 5.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div className="bg-[#121A30] border border-slate-800 rounded p-4 space-y-3">
                <span className="block text-xs font-mono font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-1.5">Contact Operations</span>
                
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Representative:</strong> {selectedVendor.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-mono">{selectedVendor.phone || 'No registered phone'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-mono">{selectedVendor.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{selectedVendor.address || 'No registered HQ address'}</span>
                  </div>
                </div>
              </div>

              {/* Past POs */}
              <div>
                <span className="block text-xs font-mono font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" /> Procurement History (POs)
                </span>
                
                {selectedVendor.pastPOs && selectedVendor.pastPOs.length === 0 ? (
                  <div className="text-center py-6 bg-[#121A30] border border-slate-850 rounded text-slate-500 text-xs font-mono">
                    NO RECORDED PURCHASE ORDERS
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedVendor.pastPOs?.map((po) => (
                      <div key={po.id} className="bg-[#121A30] border border-slate-800 rounded p-3 text-xs flex justify-between items-center hover:border-slate-700 transition-colors">
                        <div>
                          <p className="font-mono text-indigo-400 font-bold">{po.id}</p>
                          <p className="font-semibold text-slate-200 mt-0.5">{po.title}</p>
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" /> {po.date}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-medium text-white flex items-center justify-end">
                            <DollarSign className="w-3 h-3 text-slate-500" /> {po.amount.toLocaleString()}
                          </p>
                          <span className="inline-block mt-1 scale-90 origin-right px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border border-emerald-900/40 bg-emerald-950/20 text-emerald-400 uppercase">
                            {po.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating History */}
              <div>
                <span className="block text-xs font-mono font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-warning" /> Quality Rating Log
                </span>

                {selectedVendor.ratingHistory && selectedVendor.ratingHistory.length === 0 ? (
                  <div className="text-center py-6 bg-[#121A30] border border-slate-850 rounded text-slate-500 text-xs font-mono">
                    NO AUDIT HISTORY ON FILE
                  </div>
                ) : (
                  <div className="border-l border-slate-800 pl-4 space-y-4 ml-2 mt-2">
                    {selectedVendor.ratingHistory?.map((audit, index) => (
                      <div key={index} className="relative">
                        {/* Timeline Node */}
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-brand ring-4 ring-[#0E1527]" />
                        
                        <div className="text-xs">
                          <div className="flex items-center gap-2 justify-between">
                            <span className="text-[10px] font-mono text-slate-500">{audit.date}</span>
                            <div className="flex items-center gap-0.5 text-amber-warning">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="font-mono font-bold">{audit.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="text-slate-300 mt-1">{audit.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </>
      )}

      {/* CSS Slide-in Animation styles */}
      <style>{`
        @keyframes slideLeft {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-left {
          animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

    </div>
  );
};

export default Vendors;
