import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Calendar, Clock, Eye, X
} from 'lucide-react';

const generatePORef = () => `PO-2024-00${Math.floor(10 + Math.random() * 90)}`;

const Quotations = () => {
  const { rfqs, quotations, updateQuotationStatus, addApproval, approvals } = useApp();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Active RFQ filter selection
  const activeRFQs = rfqs.filter(r => r.status === 'Sent');
  const [selectedRFQId, setSelectedRFQId] = useState(activeRFQs[0]?.id || 'RFQ-2024-001');

  // Detail Modal states
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Active RFQ details
  const currentRFQ = rfqs.find(r => r.id === selectedRFQId);

  // Filter quotations for selected RFQ
  const currentQuotations = quotations.filter(q => q.rfqId === selectedRFQId);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  const handleAcceptQuotation = (quotation) => {
    // 1. Update quotation status
    updateQuotationStatus(quotation.id, 'Accepted');
    
    // 2. Reject other quotations for this RFQ
    currentQuotations.forEach(q => {
      if (q.id !== quotation.id) {
        updateQuotationStatus(q.id, 'Rejected');
      }
    });

    // 3. Create Approval Workflow Record if not already created
    const refNum = generatePORef();
    const hasExistingApproval = approvals.some(app => app.rfqId === quotation.rfqId && app.vendorName === quotation.vendorName);
    
    if (!hasExistingApproval) {
      addApproval({
        poReference: refNum,
        rfqId: quotation.rfqId,
        rfqTitle: currentRFQ?.title || 'Sourced Procurement Parts',
        vendorName: quotation.vendorName,
        amount: quotation.grandTotal,
        requestedBy: user?.name || 'Procurement Officer',
        status: 'Pending',
        remarks: `Auto-generated approval request following acceptance of Quotation ${quotation.id}.`
      });
    }

    addToast(`Quotation ${quotation.id} accepted. Proceeding to Approvals workflow.`, 'success');
    
    // Redirect to comparison or approvals page
    navigate('/approvals');
  };

  const handleRejectQuotation = (quotationId) => {
    updateQuotationStatus(quotationId, 'Rejected');
    addToast(`Quotation ${quotationId} has been rejected.`, 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* Selector Dropdown Header */}
      <div className="bg-slate-surface border border-slate-700 p-4 rounded shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Select RFQ Project Inquiry</label>
          <select
            value={selectedRFQId}
            onChange={(e) => setSelectedRFQId(e.target.value)}
            className="w-full md:w-80 font-mono text-xs bg-[#0D1527] border border-slate-700"
          >
            {rfqs.map((rfq) => (
              <option key={rfq.id} value={rfq.id}>
                {rfq.id} - {rfq.title} ({rfq.status})
              </option>
            ))}
          </select>
        </div>

        {currentRFQ && (
          <div className="text-xs bg-[#0E1527] border border-slate-800 rounded p-3 font-mono flex-1 md:max-w-md">
            <p className="text-slate-400"><strong className="text-indigo-400">Project Deadline:</strong> {currentRFQ.deadline}</p>
            <p className="text-slate-400 mt-1 truncate"><strong className="text-indigo-400">Solicitations:</strong> {currentRFQ.assignedVendors.length} vendors invited</p>
          </div>
        )}
      </div>

      {/* Quotations Card Grid */}
      {currentQuotations.length === 0 ? (
        <div className="bg-slate-surface border border-slate-700 p-12 text-center text-slate-500 font-mono text-xs rounded">
          NO BID SUBMISSIONS RECORDED FOR SELECTED RFQ YET
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentQuotations.map((q) => {
            const initials = q.vendorName.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
            return (
              <div 
                key={q.id}
                className={`bg-slate-surface border rounded-lg shadow-lg flex flex-col justify-between overflow-hidden transition-all ${
                  q.status === 'Accepted' ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.05)]' :
                  q.status === 'Rejected' ? 'border-rose-500/20 opacity-60' :
                  'border-slate-700 hover:border-slate-500'
                }`}
              >
                
                {/* Header */}
                <div className="p-4 bg-[#121A30] border-b border-slate-800 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-indigo-950/80 border border-indigo-900/50 flex items-center justify-center font-mono text-xs text-indigo-400 font-bold">
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm truncate max-w-[140px]" title={q.vendorName}>
                        {q.vendorName}
                      </h4>
                      <span className="text-[10px] font-mono text-indigo-400 font-bold block">{q.id}</span>
                    </div>
                  </div>

                  <span className={`badge-status scale-90 origin-right ${
                    q.status === 'Accepted' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' :
                    q.status === 'Rejected' ? 'bg-rose-950/40 text-rose-400 border-rose-800/40' :
                    q.status === 'Submitted' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-800/40' :
                    'bg-amber-950/40 text-amber-warning border-amber-800/40'
                  }`}>
                    {q.status}
                  </span>
                </div>

                {/* Details Content */}
                <div className="p-4 space-y-4 flex-1">
                  
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{q.submissionDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{q.deliveryTimeline}</span>
                    </div>
                  </div>

                  {/* Summary of items */}
                  <div className="bg-[#0D1527] border border-slate-850 rounded p-2.5 text-xs text-slate-400">
                    <p className="font-mono text-[10px] uppercase font-bold text-slate-500 mb-1 border-b border-slate-800 pb-1">Tender Scope Summary</p>
                    <ul className="space-y-1">
                      {q.items.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span className="truncate max-w-[150px] font-medium text-slate-300">{item.name}</span>
                          <span className="font-mono">{item.qty} {item.unit || 'Pcs'}</span>
                        </li>
                      ))}
                      {q.items.length > 2 && (
                        <li className="text-[10px] text-slate-500 italic mt-1">+ {q.items.length - 2} more item specifications</li>
                      )}
                    </ul>
                  </div>

                  {/* Financial Fields */}
                  <div className="border-t border-slate-800 pt-3 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Grand Total (Incl Tax)</span>
                      <p className="text-xl font-bold font-mono text-white tracking-tight">{formatCurrency(q.grandTotal)}</p>
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-500">
                      <span>Subtotal: {formatCurrency(q.subtotal)}</span>
                      <span className="block">Tax: {q.taxPercentage}% GST</span>
                    </div>
                  </div>

                </div>

                {/* Card footer actions */}
                <div className="p-3 bg-[#0B1123] border-t border-slate-800 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedQuotation(q);
                      setIsDetailModalOpen(true);
                    }}
                    className="flex-1 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 py-1.5 rounded text-xs font-mono flex items-center justify-center gap-1 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                  {user?.role !== 'vendor' && q.status !== 'Accepted' && q.status !== 'Rejected' && (
                    <>
                      <button
                        onClick={() => handleAcceptQuotation(q)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-3.5 py-1.5 rounded transition-all shadow-md"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectQuotation(q.id)}
                        className="bg-rose-950 hover:bg-rose-900 border border-rose-800/40 text-rose-400 font-mono text-xs px-2.5 py-1.5 rounded transition-all"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* QUOTATION LINE-ITEMS SPEC DETAIL MODAL */}
      {isDetailModalOpen && selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-[#121A30] border border-slate-700 rounded-lg shadow-2xl p-6 font-sans">
            
            {/* Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="font-mono text-xs text-indigo-400 font-bold">{selectedQuotation.id} - COMMERCIAL BID</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">{selectedQuotation.vendorName}</h3>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scope info */}
            <div className="space-y-4">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-[#0D1527] border border-slate-800 rounded p-3 font-mono">
                <div>
                  <span className="text-slate-500 block">Lead Timeline</span>
                  <span className="text-slate-200 font-semibold">{selectedQuotation.deliveryTimeline}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Payment Terms</span>
                  <span className="text-slate-200 font-semibold">{selectedQuotation.paymentTerms}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Subtotal</span>
                  <span className="text-slate-200">{formatCurrency(selectedQuotation.subtotal)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tax Surcharge</span>
                  <span className="text-slate-200">{selectedQuotation.taxPercentage}% GST</span>
                </div>
              </div>

              {/* Remarks/Warranty */}
              <div>
                <span className="block text-xs font-mono text-slate-400 uppercase mb-1">Warranty Details & Terms</span>
                <p className="text-xs text-slate-300 bg-[#0D1527] border border-slate-800 rounded p-3 leading-relaxed">
                  {selectedQuotation.warrantyNotes || 'No specific commercial warranty clauses provided.'}
                </p>
              </div>

              {/* Items Table */}
              <div>
                <span className="block text-xs font-mono text-slate-400 uppercase mb-2">Item Commercial breakdown</span>
                <div className="border border-slate-800 rounded overflow-hidden">
                  <table>
                    <thead>
                      <tr>
                        <th>Line Item Description</th>
                        <th className="w-24 text-right">Unit Price</th>
                        <th className="w-20 text-right">Quantity</th>
                        <th className="w-28 text-right">Total Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuotation.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="font-semibold text-slate-200">{item.name}</td>
                          <td className="font-mono text-xs text-right text-slate-400">{formatCurrency(item.unitPrice)}</td>
                          <td className="font-mono text-xs text-right text-slate-400">{item.qty}</td>
                          <td className="font-mono text-xs text-right text-white font-semibold">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                      
                      {/* Financial summary rows */}
                      <tr className="bg-[#0B1123] hover:bg-transparent">
                        <td colSpan="2" className="border-0"></td>
                        <td className="font-mono text-xs text-right text-slate-500 border-0">Subtotal:</td>
                        <td className="font-mono text-xs text-right text-slate-200 border-0">{formatCurrency(selectedQuotation.subtotal)}</td>
                      </tr>
                      <tr className="bg-[#0B1123] hover:bg-transparent">
                        <td colSpan="2" className="border-0"></td>
                        <td className="font-mono text-xs text-right text-slate-500 border-0">GST ({selectedQuotation.taxPercentage}%):</td>
                        <td className="font-mono text-xs text-right text-slate-200 border-0">{formatCurrency(selectedQuotation.subtotal * (selectedQuotation.taxPercentage/100))}</td>
                      </tr>
                      <tr className="bg-[#0B1123] hover:bg-transparent">
                        <td colSpan="2" className="border-0"></td>
                        <td className="font-mono text-xs text-right text-slate-400 font-bold uppercase border-0">Grand Total:</td>
                        <td className="font-mono text-sm text-right text-indigo-400 font-bold border-0">{formatCurrency(selectedQuotation.grandTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-transparent text-slate-400 hover:text-white font-mono text-xs uppercase"
              >
                Close breakdown
              </button>
              {user?.role !== 'vendor' && selectedQuotation.status !== 'Accepted' && selectedQuotation.status !== 'Rejected' && (
                <button
                  type="button"
                  onClick={() => {
                    handleAcceptQuotation(selectedQuotation);
                    setIsDetailModalOpen(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase rounded"
                >
                  Accept & Transit to Approval
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Quotations;
