import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  CheckCircle, XCircle, ArrowRight, Clock, 
  MessageSquare, Calendar, History, AlertCircle 
} from 'lucide-react';

const Approvals = () => {
  const { approvals, updateApproval } = useApp();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Active card selected for the right-hand audit timeline sidebar
  const [activeApprovalId, setActiveApprovalId] = useState(approvals[0]?.id || null);

  // Modal states
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState('Approved'); // Approved, Rejected
  const [targetApproval, setTargetApproval] = useState(null);
  const [remarksText, setRemarksText] = useState('');

  const activeApproval = approvals.find(a => a.id === activeApprovalId) || approvals[0];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  const handleOpenDecisionModal = (approval, type, e) => {
    e.stopPropagation(); // Prevent focusing card change
    setTargetApproval(approval);
    setDecisionType(type);
    setRemarksText('');
    setIsDecisionModalOpen(true);
  };

  const handleConfirmDecision = (e) => {
    e.preventDefault();
    if (!targetApproval) return;

    updateApproval(
      targetApproval.id,
      decisionType,
      remarksText || `${decisionType} the PO request contract.`,
      user?.name || 'System Manager'
    );

    addToast(`Purchase request ${targetApproval.poReference} ${decisionType.toLowerCase()} successfully.`, 'success');
    setIsDecisionModalOpen(false);
    
    // Automatically select the updated card to refresh the timeline
    setActiveApprovalId(targetApproval.id);
  };

  const handleGeneratePO = (approval, e) => {
    e.stopPropagation();
    // Redirect to Invoice page with approved PO reference as parameters
    navigate(`/invoice?poRef=${approval.poReference}&vendorName=${encodeURIComponent(approval.vendorName)}&amount=${approval.amount}`);
  };

  const renderCard = (app) => {
    const isActive = activeApproval?.id === app.id;
    return (
      <div 
        key={app.id}
        onClick={() => setActiveApprovalId(app.id)}
        className={`bg-[#121A30] border rounded-lg p-3.5 space-y-3 cursor-pointer hover:border-slate-500 transition-all relative ${
          isActive ? 'border-indigo-brand ring-1 ring-indigo-brand' : 'border-slate-800'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <span className="font-mono text-xs text-indigo-400 font-bold">{app.poReference}</span>
            <h5 className="font-semibold text-slate-100 text-xs mt-0.5 uppercase tracking-wide truncate max-w-[150px]">{app.vendorName}</h5>
          </div>
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {app.date}
          </span>
        </div>

        {/* Info */}
        <div className="text-xs text-slate-400">
          <p className="font-medium text-slate-200 truncate">{app.rfqTitle}</p>
          <span className="text-[10px] text-slate-500 font-mono">Requested: {app.requestedBy}</span>
        </div>

        {/* Amount */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-2">
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase">Valuation</span>
            <p className="font-mono font-bold text-white text-sm">{formatCurrency(app.amount)}</p>
          </div>
          
          {/* Action tags */}
          <div className="flex gap-1">
            {app.status === 'Pending' && (
              <>
                {user?.role === 'manager' || user?.role === 'admin' ? (
                  <>
                    <button
                      onClick={(e) => handleOpenDecisionModal(app, 'Approved', e)}
                      className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/40 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded transition-all"
                    >
                      Appr
                    </button>
                    <button
                      onClick={(e) => handleOpenDecisionModal(app, 'Rejected', e)}
                      className="bg-rose-950 hover:bg-rose-900 border border-rose-800/40 text-rose-400 font-mono text-[10px] px-2 py-0.5 rounded transition-all"
                    >
                      Rej
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-500 italic font-mono bg-slate-900 px-1.5 py-0.5 border border-slate-800 rounded">
                    AWAITING AUTH
                  </span>
                )}
              </>
            )}

            {app.status === 'Approved' && (
              <button
                onClick={(e) => handleGeneratePO(app, e)}
                className="bg-indigo-950 hover:bg-indigo-900 border border-indigo-800/40 text-indigo-400 font-mono text-[10px] px-2 py-0.5 rounded transition-all flex items-center gap-0.5"
              >
                PO Setup <ArrowRight className="w-2.5 h-2.5" />
              </button>
            )}

            {app.status === 'Rejected' && (
              <span className="bg-rose-950/20 text-rose-400 border border-rose-900/30 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">
                REJECTED
              </span>
            )}
          </div>
        </div>

        {/* Remarks preview if present */}
        {app.remarks && (
          <div className="text-[10px] bg-[#0E1527] p-2 border border-slate-850 rounded text-slate-400 flex items-start gap-1 font-mono italic">
            <MessageSquare className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
            <span className="truncate">{app.remarks}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      
      {/* 3-Column Kanban Board */}
      <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        
        {/* Column: Pending */}
        <div className="bg-slate-surface border border-slate-700 rounded-lg p-3 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-warning" /> Pending Approvals
            </span>
            <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs font-mono">
              {approvals.filter(a => a.status === 'Pending').length}
            </span>
          </div>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {approvals.filter(a => a.status === 'Pending').length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs bg-[#0E1527] border border-slate-850 border-dashed rounded">
                NO REQUESTS PENDING
              </div>
            ) : (
              approvals.filter(a => a.status === 'Pending').map(renderCard)
            )}
          </div>
        </div>

        {/* Column: Approved */}
        <div className="bg-slate-surface border border-slate-700 rounded-lg p-3 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Approved
            </span>
            <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs font-mono">
              {approvals.filter(a => a.status === 'Approved').length}
            </span>
          </div>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {approvals.filter(a => a.status === 'Approved').length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs bg-[#0E1527] border border-slate-850 border-dashed rounded">
                NO APPROVED RECORDS
              </div>
            ) : (
              approvals.filter(a => a.status === 'Approved').map(renderCard)
            )}
          </div>
        </div>

        {/* Column: Rejected */}
        <div className="bg-slate-surface border border-slate-700 rounded-lg p-3 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-500" /> Rejected
            </span>
            <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs font-mono">
              {approvals.filter(a => a.status === 'Rejected').length}
            </span>
          </div>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {approvals.filter(a => a.status === 'Rejected').length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs bg-[#0E1527] border border-slate-850 border-dashed rounded">
                NO REJECTED RECORDS
              </div>
            ) : (
              approvals.filter(a => a.status === 'Rejected').map(renderCard)
            )}
          </div>
        </div>

      </div>

      {/* TIMELINE SIDEBAR PANEL (Right panel) */}
      <div className="xl:col-span-1 bg-slate-surface border border-slate-700 rounded-lg p-4 flex flex-col justify-between h-fit sticky top-24">
        <div>
          <div className="border-b border-slate-800 pb-2 mb-4 flex items-center gap-1.5">
            <History className="w-4.5 h-4.5 text-indigo-400" />
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Audit Transaction Log</h4>
          </div>

          {activeApproval ? (
            <div className="space-y-4">
              
              {/* Header meta context */}
              <div className="bg-[#0D1527] border border-slate-850 rounded p-3 text-xs font-mono space-y-1">
                <p className="text-slate-500 uppercase text-[9px] font-bold">ACTIVE CONTRACT PROFILE</p>
                <p className="text-indigo-400 font-semibold">{activeApproval.poReference}</p>
                <p className="text-slate-200 mt-1 truncate">Vendor: {activeApproval.vendorName}</p>
                <p className="text-slate-300">Net Surcharge: {formatCurrency(activeApproval.amount)}</p>
                <div className="pt-2">
                  <span className={`badge-status scale-90 origin-left ${
                    activeApproval.status === 'Approved' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' :
                    activeApproval.status === 'Rejected' ? 'bg-rose-950/40 text-rose-400 border-rose-800/40' :
                    'bg-amber-950/40 text-amber-warning border-amber-800/40'
                  }`}>{activeApproval.status}</span>
                </div>
              </div>

              {/* Vertical timeline */}
              <div>
                <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">SLA PROGRESS TRANSITIONS</span>
                
                <div className="border-l border-slate-800 pl-4 space-y-5 ml-2">
                  {activeApproval.timeline?.map((step, idx) => (
                    <div key={idx} className="relative">
                      {/* Node circle indicator */}
                      <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-[#1E2640] ${
                        step.state === 'Approved' ? 'bg-emerald-500' :
                        step.state === 'Rejected' ? 'bg-rose-500' :
                        'bg-indigo-400'
                      }`} />
                      
                      <div className="text-xs space-y-1 font-sans">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                          <span>{step.timestamp}</span>
                          <span className="font-bold text-slate-400">{step.actor}</span>
                        </div>
                        <p className="font-semibold text-slate-200">State Transition: {step.state}</p>
                        <p className="text-slate-400 text-[11px] leading-relaxed font-mono italic">"{step.comments}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 font-mono text-xs italic">
              SELECT ANY APPROVAL CARD TO RENDER EVENT AUDIT TRAILS
            </div>
          )}
        </div>
      </div>

      {/* ACTION REMARKS DIALOG MODAL */}
      {isDecisionModalOpen && targetApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121A30] border border-slate-700 rounded-lg shadow-2xl p-5 font-sans animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-4">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-indigo-400" /> Add Audit Action Remarks
              </span>
              <button onClick={() => setIsDecisionModalOpen(false)} className="text-slate-500 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDecision} className="space-y-4">
              <p className="text-xs text-slate-300 leading-normal">
                Submit commercial audit reviews or justifications for contract reference: <strong className="text-indigo-400 font-mono">{targetApproval.poReference}</strong>.
              </p>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Evaluation Comments / Remarks *</label>
                <textarea
                  required
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  rows="3"
                  className="w-full text-xs"
                  placeholder="Insert audit statements here..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDecisionModalOpen(false)}
                  className="px-4 py-1.5 bg-transparent text-slate-400 hover:text-white font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 font-mono text-xs uppercase text-white rounded transition-colors shadow-md ${
                    decisionType === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirm {decisionType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Approvals;
