import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { 
  FileText, Printer, Mail, Download, Plus, 
  Trash2, X, Send, CheckCircle
} from 'lucide-react';

const Invoice = () => {
  const { vendors } = useApp();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPoId, setSelectedPoId] = useState('');
  
  const [poDetails, setPoDetails] = useState(null);
  const [quotationDetails, setQuotationDetails] = useState(null);
  const [rfqDetails, setRfqDetails] = useState(null);
  
  const [existingInvoice, setExistingInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [billTo, setBillTo] = useState('VendorBridge Industries Ltd, Corporate Hub, Tower C, NY 10001');
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days');
  const [notes, setNotes] = useState('Payment is required within terms. Bank details are attached below.');

  // Modal Email state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailDetails, setEmailDetails] = useState({ to: '', subject: '', body: '' });

  useEffect(() => {
    const fetchInit = async () => {
      try {
        setLoading(true);
        const poRes = await api.get('/api/purchase-orders');
        setPurchaseOrders(poRes.data);

        const params = new URLSearchParams(location.search);
        const poId = params.get('poId');
        
        if (poId && poRes.data.some(p => p.id.toString() === poId)) {
          setSelectedPoId(poId);
        } else if (poRes.data.length > 0) {
          setSelectedPoId(poRes.data[0].id.toString());
        }
      } catch (err) {
        addToast('Failed to load purchase orders', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchInit();
  }, [location]);

  useEffect(() => {
    const fetchPoData = async () => {
      if (!selectedPoId) return;
      try {
        const poRes = await api.get(`/api/purchase-orders/${selectedPoId}`);
        setPoDetails(poRes.data);

        const qRes = await api.get(`/api/quotations/${poRes.data.quotation_id}`);
        setQuotationDetails(qRes.data);

        const rRes = await api.get(`/api/rfqs/${qRes.data.rfq_id}`);
        setRfqDetails(rRes.data);

        // Check if invoice already exists for this PO
        const invRes = await api.get('/api/invoices');
        const match = invRes.data.find(inv => inv.purchase_order_id.toString() === selectedPoId);
        if (match) {
          setExistingInvoice(match);
          setPaymentTerms(match.payment_terms || 'Net 30 Days');
          setDueDate(match.due_date.split('T')[0]);
        } else {
          setExistingInvoice(null);
          setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        }

      } catch (err) {
        console.error('Failed to load PO dependencies', err);
      }
    };
    fetchPoData();
  }, [selectedPoId]);

  const activeVendor = vendors.find(v => v.id === poDetails?.vendor_id);

  // Reconstruct Line Items
  const getLineItems = () => {
    if (!rfqDetails || !quotationDetails) return [];
    const totalQty = rfqDetails.items.reduce((sum, item) => sum + parseFloat(item.quantity || 1), 0) || 1;
    return rfqDetails.items.map(item => {
      const qty = parseFloat(item.quantity || 1);
      const ratio = qty / totalQty;
      const itemTotal = parseFloat(quotationDetails.subtotal) * ratio;
      return {
        name: item.item_name,
        description: item.item_name,
        qty: qty,
        unitPrice: itemTotal / qty,
        total: itemTotal
      };
    });
  };

  const lineItems = getLineItems();
  const subtotal = quotationDetails ? parseFloat(quotationDetails.subtotal) : 0;
  const taxRate = quotationDetails ? parseFloat(quotationDetails.tax_percent) : 0;
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = quotationDetails ? parseFloat(quotationDetails.grand_total) : 0;

  const handlePrint = () => window.print();

  const handleSendEmail = (e) => {
    e.preventDefault();
    addToast(`Email invoice dispatch scheduled to ${emailDetails.to}`, 'success');
    setIsEmailModalOpen(false);
  };

  const handleOpenEmail = () => {
    setEmailDetails({
      to: activeVendor?.email || '',
      subject: `Invoice for PO ${poDetails?.po_number}`,
      body: `Dear ${activeVendor?.contactPerson || 'Vendor'},\n\nPlease find attached the invoice/PO document for ${poDetails?.po_number}.\n\nWarm regards,\nVendorBridge Procurement`
    });
    setIsEmailModalOpen(true);
  };

  const handleSaveInvoice = async () => {
    if (existingInvoice) return;
    try {
      const payload = {
        purchase_order_id: poDetails.id,
        payment_terms: paymentTerms,
        due_date: dueDate ? `${dueDate}T00:00:00Z` : null
      };
      const res = await api.post('/api/invoices', payload);
      setExistingInvoice(res.data);
      addToast(`Invoice ${res.data.invoice_number} successfully generated.`, 'success');
    } catch (err) {
      if (err.response?.status === 403) {
        addToast('Permission denied. Admin/Procurement only.', 'error');
      } else {
        addToast('Failed to generate invoice.', 'error');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      
      {/* LEFT PANEL: INPUT FORM */}
      <div className="bg-slate-surface border border-slate-700 rounded-lg p-5 space-y-5 no-print">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
          <FileText className="w-4.5 h-4.5 text-indigo-400" /> Commercial Document Generator
        </h3>

        {loading ? (
          <div className="text-center py-10 font-mono text-xs text-slate-500">LOADING PO DATA...</div>
        ) : purchaseOrders.length === 0 ? (
          <div className="text-center py-10 font-mono text-xs text-slate-500 bg-[#0E1527] border border-dashed border-slate-700 rounded">
            NO PURCHASE ORDERS AVAILABLE
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            
            <div className="col-span-2">
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Select Purchase Order Source *</label>
              <select
                value={selectedPoId}
                onChange={(e) => setSelectedPoId(e.target.value)}
                className="w-full font-sans text-xs bg-[#0D1527] border border-slate-700"
              >
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>{po.po_number} - {po.status}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Billing Office (Bill-To)</label>
              <textarea
                value={billTo}
                onChange={(e) => setBillTo(e.target.value)}
                rows="2"
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Payment Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={!!existingInvoice}
                className="w-full font-mono text-xs disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Payment SLA Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                disabled={!!existingInvoice}
                className="w-full text-xs bg-[#0D1527] disabled:opacity-50"
              >
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="Net 45 Days">Net 45 Days</option>
                <option value="Immediate">Immediate COD</option>
              </select>
            </div>

            {/* Readonly summaries of backend-driven prices */}
            <div className="col-span-2 bg-[#0D1527] border border-slate-800 p-3 rounded mt-2 text-xs font-mono text-slate-400">
              <p className="uppercase text-[10px] font-bold text-slate-500 mb-2">Automated Pricing Link (From Quotation #{quotationDetails?.id})</p>
              <div className="flex justify-between"><span>Sourced Items:</span> <span className="text-white">{lineItems.length} specific items</span></div>
              <div className="flex justify-between"><span>Tax Rate applied:</span> <span className="text-white">{taxRate}%</span></div>
              <div className="flex justify-between"><span>Grand Total calculation:</span> <span className="text-white">${grandTotal.toLocaleString()}</span></div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Footer Notes / Terms</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                className="w-full text-xs"
              />
            </div>

          </div>
        )}

        {/* Actions button */}
        <div className="pt-4 border-t border-slate-800 flex justify-between gap-2">
          {!existingInvoice ? (
            <button
              onClick={handleSaveInvoice}
              disabled={loading || !selectedPoId}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded text-xs font-mono font-medium uppercase transition-colors shadow-md disabled:opacity-50"
            >
              Generate Official Invoice
            </button>
          ) : (
            <div className="flex-1 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 py-2 rounded text-xs font-mono font-bold uppercase text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Invoice Created ({existingInvoice.invoice_number})
            </div>
          )}
          <button
            onClick={handleOpenEmail}
            disabled={!poDetails}
            className="flex-1 bg-indigo-brand hover:bg-indigo-700 text-white py-2 rounded text-xs font-mono font-medium uppercase transition-colors flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Mail className="w-4 h-4" /> Send Email
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: LIVE INVOICE PREVIEW */}
      <div className="space-y-4">
        
        <div className="flex justify-end gap-2 no-print">
          <button
            onClick={handlePrint}
            className="bg-[#1E2640] hover:bg-slate-700 border border-slate-700 text-slate-200 px-3.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition-all shadow-md"
          >
            <Printer className="w-4 h-4" /> Print Document
          </button>
          <button
            onClick={handlePrint}
            className="bg-indigo-brand hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition-all shadow-md"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>

        <div className="bg-white text-slate-800 p-8 rounded shadow-2xl print-area mx-auto max-w-[210mm] min-h-[297mm] font-sans flex flex-col justify-between">
          <div className="space-y-6">
            
            <div className="flex justify-between items-start border-b-2 border-indigo-900 pb-5">
              <div>
                <div className="flex items-center gap-1 text-indigo-900 font-extrabold text-lg uppercase tracking-tight">
                  <img src="/vendorbridge_logo.png" alt="Logo" className="w-6 h-6 rounded object-cover mr-1" />
                  VendorBridge ERP
                </div>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono tracking-widest">COMMERCIAL PURCHASE SYSTEM</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold tracking-tight text-indigo-900 uppercase">COMMERCIAL INVOICE</h2>
                <p className="font-mono text-xs text-slate-500 mt-0.5">PO REF: {poDetails?.po_number || 'DRAFT'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs text-slate-600">
              <div className="space-y-2">
                <span className="block font-bold text-indigo-900 uppercase tracking-wide text-[10px]">SUPPLIER REMITTANCE</span>
                <div className="border-l-2 border-indigo-900/20 pl-3 space-y-1">
                  <p className="font-bold text-slate-800 text-sm uppercase">{activeVendor?.name || '---'}</p>
                  <p className="font-mono text-[11px]">GST REG: {activeVendor?.gstNumber || '---'}</p>
                  <p>{activeVendor?.contactPerson} ({activeVendor?.email})</p>
                  <p className="max-w-[220px] leading-relaxed truncate">{activeVendor?.address}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block font-bold text-indigo-900 uppercase tracking-wide text-[10px]">BILL TO OFFICE</span>
                <div className="border-l-2 border-slate-300 pl-3 space-y-1">
                  <p className="font-bold text-slate-800 text-sm uppercase">VENDORBRIDGE INDUSTRIES LTD</p>
                  <p className="leading-relaxed">{billTo}</p>
                  <div className="pt-1 text-[11px] grid grid-cols-2 gap-1 font-mono">
                    <div>
                      <span className="text-slate-500 block">INVOICE ID</span>
                      <span className="font-bold text-slate-700">{existingInvoice?.invoice_number || 'PENDING GENERATION'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">DUE DATE</span>
                      <span className="font-bold text-slate-700">{dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 text-indigo-900">
                    <th className="py-2.5 px-3 font-bold uppercase">Item Specification Description</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-right w-20">Qty</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-right w-28">Unit Cost</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-right w-28">Net Surcharge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.description}</p>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">{item.qty}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">${item.unitPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-800 font-semibold">${item.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</td>
                    </tr>
                  ))}
                  {lineItems.length === 0 && (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-400 italic">No items retrieved from quotation</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <div className="w-72 space-y-2 text-xs font-sans text-slate-600">
                <div className="flex justify-between">
                  <span>Net Sourced Subtotal:</span>
                  <span className="font-mono text-slate-800 font-semibold">${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Surcharge ({taxRate}%):</span>
                  <span className="font-mono text-slate-800">${taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                </div>
                <div className="flex justify-between border-t border-slate-350 pt-2 text-indigo-900 font-extrabold text-sm">
                  <span>TOTAL SURCHARGE DUE:</span>
                  <span className="font-mono text-base">${grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-6 mt-12 grid grid-cols-2 gap-4 text-[10px] text-slate-500">
            <div>
              <span className="block font-bold text-indigo-900 uppercase tracking-wide text-[9px] mb-1">REMITTANCE SLA TERMS</span>
              <p className="leading-relaxed">{notes}</p>
              <p className="mt-1">SLA Agreement Profile: <strong>{paymentTerms}</strong></p>
            </div>
            
            <div className="border-l border-slate-300 pl-4 space-y-1">
              <span className="block font-bold text-indigo-900 uppercase tracking-wide text-[9px] mb-1">BANK TRANSFER METRICS</span>
              <p className="font-mono">Bank Name: Apex Industrial Sourcing Bank</p>
              <p className="font-mono">SWIFT Routing Code: APEXINDE1289</p>
              <p className="font-mono">IBAN Account: US24 0987 6543 2109 8890</p>
            </div>
          </div>
        </div>
      </div>

      {/* EMAIL MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
          <div className="w-full max-w-md bg-[#121A30] border border-slate-700 rounded-lg shadow-2xl p-5 font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-4">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4 text-indigo-400" /> Dispatch Commercial Document
              </span>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">To (Supplier Inbox) *</label>
                <input
                  type="email" required
                  value={emailDetails.to}
                  onChange={(e) => setEmailDetails({ ...emailDetails, to: e.target.value })}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Subject Header *</label>
                <input
                  type="text" required
                  value={emailDetails.subject}
                  onChange={(e) => setEmailDetails({ ...emailDetails, subject: e.target.value })}
                  className="w-full text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Message Body</label>
                <textarea
                  value={emailDetails.body}
                  onChange={(e) => setEmailDetails({ ...emailDetails, body: e.target.value })}
                  rows="5"
                  className="w-full text-xs text-slate-200 font-sans"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsEmailModalOpen(false)} className="px-4 py-1.5 bg-transparent text-slate-400 hover:text-white font-mono text-xs uppercase">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-brand hover:bg-indigo-700 text-white font-mono text-xs uppercase rounded flex items-center gap-1 transition-colors">
                  Dispatch Email <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Invoice;
