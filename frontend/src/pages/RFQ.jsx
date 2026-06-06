import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Plus, Trash2, ChevronRight, ChevronLeft, 
  ArrowRight, Search, Eye, Trash, X
} from 'lucide-react';

const RFQ = () => {
  const { rfqs, vendors, addRFQ } = useApp();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('all'); // all, create
  
  // All RFQs Tab filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // RFQ Detail Modal state
  const [selectedRFQ, setSelectedRFQ] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Sourcing Wizard state
  const [step, setStep] = useState(1);
  const [rfqDetails, setRfqDetails] = useState({
    title: '',
    description: '',
    category: 'Manufacturing',
    deadline: ''
  });
  
  const [lineItems, setLineItems] = useState([
    { name: '', description: '', qty: 1, unit: 'Pcs' }
  ]);
  
  const [assignedVendors, setAssignedVendors] = useState([]);
  const [vendorSearch, setVendorSearch] = useState('');

  // Role permissions
  const canCreateRFQ = user?.role === 'admin' || user?.role === 'procurement_officer';

  // Sourcing wizard items manipulation
  const handleAddItemRow = () => {
    setLineItems([...lineItems, { name: '', description: '', qty: 1, unit: 'Pcs' }]);
  };

  const handleRemoveItemRow = (index) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  const handleToggleVendor = (vendorId) => {
    if (assignedVendors.includes(vendorId)) {
      setAssignedVendors(assignedVendors.filter(id => id !== vendorId));
    } else {
      setAssignedVendors([...assignedVendors, vendorId]);
    }
  };

  // Sourcing validation
  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!rfqDetails.title.trim() || !rfqDetails.deadline) {
        addToast('Please enter an RFQ title and select a submission deadline.', 'warning');
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      const hasEmpty = lineItems.some(item => !item.name.trim() || item.qty <= 0);
      if (hasEmpty) {
        addToast('Line item names and positive quantities are required.', 'warning');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (assignedVendors.length === 0) {
      addToast('Error: Please assign at least one active supplier to this RFQ.', 'warning');
      return;
    }

    const payload = {
      title: rfqDetails.title,
      description: rfqDetails.description,
      category: rfqDetails.category,
      deadline: rfqDetails.deadline,
      createdBy: user?.name || 'Procurement Agent',
      assignedVendors,
      items: lineItems,
      status: 'Sent' // Immediately transit to Sent on creation
    };

    addRFQ(payload);
    addToast('RFQ created successfully and sent to selected vendors.', 'success');
    
    // Reset state
    setStep(1);
    setRfqDetails({ title: '', description: '', category: 'Manufacturing', deadline: '' });
    setLineItems([{ name: '', description: '', qty: 1, unit: 'Pcs' }]);
    setAssignedVendors([]);
    
    // Switch to All RFQs Tab
    setActiveTab('all');
  };

  // Filter RFQs
  const filteredRFQs = rfqs.filter(rfq => {
    const matchesSearch = rfq.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rfq.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || rfq.status === statusFilter;
    
    let matchesDate = true;
    if (dateStart) {
      matchesDate = matchesDate && rfq.date >= dateStart;
    }
    if (dateEnd) {
      matchesDate = matchesDate && rfq.date <= dateEnd;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Get vendor metadata from IDs
  const getVendorDetails = (vendorId) => {
    return vendors.find(v => v.id === vendorId);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tabs Selection */}
      <div className="border-b border-slate-700 flex justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 font-mono text-xs uppercase font-bold tracking-wider border-b-2 transition-all ${
              activeTab === 'all'
                ? 'border-indigo-brand text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            All RFQs ({filteredRFQs.length})
          </button>
          {canCreateRFQ && (
            <button
              onClick={() => setActiveTab('create')}
              className={`pb-3 font-mono text-xs uppercase font-bold tracking-wider border-b-2 transition-all ${
                activeTab === 'create'
                  ? 'border-indigo-brand text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Create RFQ Wizard
            </button>
          )}
        </div>
        
        {/* Banner context for non-buyers */}
        {!canCreateRFQ && (
          <span className="text-[10px] font-mono text-slate-500 uppercase italic">
            READ-ONLY VIEW (CREATION PERMITTED TO BUYING OFFICERS)
          </span>
        )}
      </div>

      {/* ALL RFQs VIEW */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          
          {/* Sourcing Filters */}
          <div className="flex flex-col lg:flex-row gap-4 bg-slate-surface p-4 rounded border border-slate-700 items-stretch lg:items-center">
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search RFQ id, title or project details..."
                className="w-full pl-9 pr-4 py-1.5"
              />
            </div>

            {/* Status Pills */}
            <div className="flex gap-1.5 items-center">
              {['All', 'Draft', 'Sent', 'Closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 text-xs font-mono border rounded ${
                    statusFilter === status 
                      ? 'bg-indigo-950 border-indigo-brand text-indigo-400 font-semibold' 
                      : 'bg-[#0E1527] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {status.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Date Ranges */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 uppercase">Created:</span>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="py-1 text-xs font-mono max-w-[125px]"
              />
              <span className="text-slate-500 text-xs">-</span>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="py-1 text-xs font-mono max-w-[125px]"
              />
            </div>

          </div>

          {/* Sourcing Table */}
          <div className="bg-slate-surface border border-slate-700 rounded shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>RFQ#</th>
                    <th>RFQ Project Title</th>
                    <th>Created By</th>
                    <th>Created On</th>
                    <th>Deadline</th>
                    <th>Sourcing Partners</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRFQs.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-12 text-slate-500 font-mono text-xs">
                        NO SOURCE INQUIRIES REGISTERED FOR THE SELECTED FILTERS
                      </td>
                    </tr>
                  ) : (
                    filteredRFQs.map((rfq) => (
                      <tr 
                        key={rfq.id}
                        onClick={() => {
                          setSelectedRFQ(rfq);
                          setIsDetailModalOpen(true);
                        }}
                        className="cursor-pointer"
                      >
                        <td className="font-mono text-xs text-indigo-400 font-bold">{rfq.id}</td>
                        <td className="font-semibold text-slate-100">{rfq.title}</td>
                        <td className="text-xs text-slate-400">{rfq.createdBy}</td>
                        <td className="font-mono text-xs">{rfq.date}</td>
                        <td className="font-mono text-xs text-slate-200">{rfq.deadline}</td>
                        <td>
                          {/* Avatar stack */}
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {rfq.assignedVendors.map((vendorId) => {
                              const details = getVendorDetails(vendorId);
                              if (!details) return null;
                              return (
                                <div 
                                  key={vendorId}
                                  className="inline-block h-6.5 w-6.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-mono text-indigo-400 font-bold"
                                  title={details.name}
                                >
                                  {details.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td>
                          <span className={`badge-status ${
                            rfq.status === 'Sent' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-800/40' :
                            rfq.status === 'Closed' ? 'bg-slate-900 text-slate-500 border-slate-800' :
                            'bg-amber-950/40 text-amber-warning border-amber-800/40'
                          }`}>
                            {rfq.status}
                          </span>
                        </td>
                        <td onClick={(e)=>e.stopPropagation()} className="text-right">
                          <button
                            onClick={() => {
                              setSelectedRFQ(rfq);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1 hover:text-white text-slate-400 hover:bg-[#1E2640] rounded transition-colors"
                            title="Review RFQ Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* CREATE RFQ FORM WIZARD */}
      {activeTab === 'create' && canCreateRFQ && (
        <div className="max-w-3xl mx-auto bg-slate-surface border border-slate-700 rounded-lg shadow-xl overflow-hidden">
          
          {/* Wizard Header Progress Bar */}
          <div className="bg-[#121A30] border-b border-slate-800 px-6 py-4">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4">Sourcing Inquiry Configuration</h3>
            
            <div className="flex items-center justify-between">
              {[
                { number: 1, label: 'RFQ Details' },
                { number: 2, label: 'Line Item Specifications' },
                { number: 3, label: 'Vendor Allocations' }
              ].map((s) => (
                <div key={s.number} className="flex items-center gap-2">
                  <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition-colors ${
                    step >= s.number 
                      ? 'bg-indigo-brand border-indigo-brand text-white' 
                      : 'border-slate-800 bg-[#0E1527] text-slate-500'
                  }`}>
                    {s.number}
                  </div>
                  <span className={`text-xs font-mono tracking-wide ${
                    step >= s.number ? 'text-slate-200' : 'text-slate-500'
                  }`}>
                    {s.label}
                  </span>
                  {s.number < 3 && <ChevronRight className="w-4 h-4 text-slate-700 hidden md:block" />}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
            
            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Inquiry Title / Project Subject *</label>
                  <input
                    type="text"
                    required
                    value={rfqDetails.title}
                    onChange={(e) => setRfqDetails({ ...rfqDetails, title: e.target.value })}
                    className="w-full"
                    placeholder="e.g. ASTM A36 Structural Carbon Steel H-Beams supply"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Sourcing Category *</label>
                  <select
                    value={rfqDetails.category}
                    onChange={(e) => setRfqDetails({ ...rfqDetails, category: e.target.value })}
                    className="w-full"
                  >
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Logistics">Logistics</option>
                    <option value="IT Support">IT Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Bid Submission Deadline *</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={rfqDetails.deadline}
                      onChange={(e) => setRfqDetails({ ...rfqDetails, deadline: e.target.value })}
                      className="w-full font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Detailed Technical Specifications / Scope</label>
                  <textarea
                    value={rfqDetails.description}
                    onChange={(e) => setRfqDetails({ ...rfqDetails, description: e.target.value })}
                    rows="4"
                    className="w-full text-xs"
                    placeholder="Input detailed delivery requirements, packaging parameters, structural design specifications, and standard testing credentials..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Line Items */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Line Item Specifications</h4>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="border border-slate-700 hover:border-slate-500 bg-[#0E1527] text-slate-300 px-3 py-1 rounded text-xs font-mono flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="border border-slate-800 rounded overflow-hidden">
                  <table>
                    <thead>
                      <tr>
                        <th>Item Name *</th>
                        <th>Brief Specifications</th>
                        <th className="w-20">Qty *</th>
                        <th className="w-24">Unit</th>
                        <th className="w-10 text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, index) => (
                        <tr key={index} className="hover:bg-transparent">
                          <td>
                            <input
                              type="text"
                              required
                              value={item.name}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                              className="w-full"
                              placeholder="Item Name"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              className="w-full"
                              placeholder="Tech details"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              required
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 0)}
                              className="w-full font-mono text-xs"
                            />
                          </td>
                          <td>
                            <select
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                              className="w-full"
                            >
                              <option value="Pcs">Pcs</option>
                              <option value="Kgs">Kgs</option>
                              <option value="Meters">Meters</option>
                              <option value="Hours">Hours</option>
                              <option value="Units">Units</option>
                            </select>
                          </td>
                          <td className="text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(index)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-950/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step 3: Assign Vendors */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Select Vendor Sourcing Pool</h4>
                  <div className="relative w-48">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-7 pr-3 py-1 text-xs"
                    />
                  </div>
                </div>

                {/* Checked tags preview */}
                {assignedVendors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 bg-[#0D1527] border border-slate-800 rounded">
                    {assignedVendors.map((vendorId) => {
                      const v = getVendorDetails(vendorId);
                      return (
                        <span key={vendorId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-900/50">
                          {v?.name || vendorId}
                          <button
                            type="button"
                            onClick={() => handleToggleVendor(vendorId)}
                            className="text-indigo-600 hover:text-indigo-400"
                          >
                            <Trash className="w-3 h-3 inline" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Vendor Checklist */}
                <div className="border border-slate-800 rounded max-h-60 overflow-y-auto divide-y divide-slate-850">
                  {vendors
                    .filter(v => v.status === 'Active' && v.category === rfqDetails.category)
                    .filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase()))
                    .map((vendor) => (
                      <label 
                        key={vendor.id}
                        className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-[#121A30]/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={assignedVendors.includes(vendor.id)}
                            onChange={() => handleToggleVendor(vendor.id)}
                            className="w-4 h-4 accent-indigo-brand rounded bg-[#0D1527] border-slate-700"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-200">{vendor.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              GST: {vendor.gstNumber} | Rating: {vendor.rating.toFixed(1)} ★
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-medium text-slate-500 bg-[#0E1527] px-2 py-0.5 rounded border border-slate-800">
                          {vendor.category.toUpperCase()}
                        </span>
                      </label>
                    ))}
                  
                  {vendors.filter(v => v.status === 'Active' && v.category === rfqDetails.category).length === 0 && (
                    <div className="p-4 text-center text-slate-500 text-xs font-mono">
                      NO ACTIVE SUPPLIERS FOUND FOR CATEGORY: {rfqDetails.category.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="pt-4 border-t border-slate-800 flex justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="bg-[#0E1527] border border-slate-800 hover:border-slate-700 text-slate-300 px-4 py-2 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Step
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-indigo-brand hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-mono flex items-center gap-1.5 transition-colors shadow-md ml-auto"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded text-xs font-mono flex items-center gap-1.5 transition-colors shadow-md ml-auto uppercase"
                >
                  Publish RFQ & Broadcast <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </form>
        </div>
      )}

      {/* RFQ DETAIL MODAL */}
      {isDetailModalOpen && selectedRFQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#121A30] border border-slate-700 rounded-lg shadow-2xl p-6 font-sans">
            <div className="flex justify-between items-start pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="font-mono text-xs text-indigo-400 font-bold">{selectedRFQ.id}</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">{selectedRFQ.title}</h3>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Project context */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#0D1527] border border-slate-800 rounded p-3 font-mono">
                <div>
                  <span className="text-slate-500 block">Sourcing Agent</span>
                  <span className="text-slate-200">{selectedRFQ.createdBy}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <span className={`badge-status inline-block scale-90 origin-left ${
                    selectedRFQ.status === 'Sent' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-800/40' :
                    selectedRFQ.status === 'Closed' ? 'bg-slate-900 text-slate-500 border-slate-800' :
                    'bg-amber-950/40 text-amber-warning border-amber-800/40'
                  }`}>{selectedRFQ.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Created On</span>
                  <span className="text-slate-200">{selectedRFQ.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Deadline Date</span>
                  <span className="text-slate-200">{selectedRFQ.deadline}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="block text-xs font-mono text-slate-400 uppercase mb-1">Detailed Technical Specifications</span>
                <p className="text-xs text-slate-300 bg-[#0D1527] border border-slate-800 rounded p-3 leading-relaxed">
                  {selectedRFQ.description || 'No description specs registered.'}
                </p>
              </div>

              {/* Line Items */}
              <div>
                <span className="block text-xs font-mono text-slate-400 uppercase mb-2">Scope Line Items</span>
                <div className="border border-slate-800 rounded overflow-hidden">
                  <table>
                    <thead>
                      <tr>
                        <th>Item Description</th>
                        <th>Specifications</th>
                        <th className="w-24 text-right">Required Qty</th>
                        <th className="w-24 text-right">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRFQ.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="font-semibold">{item.name}</td>
                          <td className="text-xs text-slate-400">{item.description || '-'}</td>
                          <td className="font-mono text-xs text-right text-white">{item.qty.toLocaleString()}</td>
                          <td className="font-mono text-xs text-right text-slate-400">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assigned Vendors */}
              <div>
                <span className="block text-xs font-mono text-slate-400 uppercase mb-2">Solicited Vendors Pool</span>
                <div className="flex flex-wrap gap-2">
                  {selectedRFQ.assignedVendors.map((vendorId) => {
                    const details = getVendorDetails(vendorId);
                    return (
                      <div 
                        key={vendorId}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#0D1527] border border-slate-800 rounded text-xs"
                      >
                        <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-mono text-indigo-400 font-bold uppercase">
                          {details?.name.split(' ').map(n=>n[0]).join('').substring(0,2)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{details?.name || vendorId}</p>
                          <p className="text-[9px] text-slate-500 font-mono">Rating: {details?.rating.toFixed(1)} ★</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-indigo-brand hover:bg-indigo-700 text-white font-mono text-xs uppercase rounded"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RFQ;
