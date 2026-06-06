import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { 
  FileText, Printer, Mail, Download, Plus, 
  Trash2, X, Send
} from 'lucide-react';

const generatePONumber = () => `PO-2024-${Math.floor(1000 + Math.random() * 9000)}`;
const generateInvoiceNumber = () => `INV-2024-${Math.floor(1000 + Math.random() * 9000)}`;
const generateDueDate = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const Invoice = () => {
  const { vendors, addInvoice } = useApp();
  const { addToast } = useToast();
  const location = useLocation();

  // Form State
  const [poNumber, setPoNumber] = useState(generatePONumber);
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber);
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || '');
  const [billTo, setBillTo] = useState('VendorBridge Industries Ltd, Corporate Hub, Tower C, NY 10001');
  const [dueDate, setDueDate] = useState(generateDueDate);
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days');
  const [notes, setNotes] = useState('Payment is required within 30 days of the invoice date. Bank details are attached below.');
  const [taxRate, setTaxRate] = useState(18); // 5%, 12%, 18%

  // Live editable items
  const [lineItems, setLineItems] = useState([
    { name: 'Industrial Machining Parts Class-A', description: 'ASTM structure standard parts', qty: 10, unitPrice: 240, total: 2400 }
  ]);

  // Modal Email state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailDetails, setEmailDetails] = useState({
    to: '',
    subject: '',
    body: ''
  });

  const activeVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];

  // Pre-fill parameters if arriving from Approvals page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const poRef = params.get('poRef');
    const vendorName = params.get('vendorName');
    const amount = parseFloat(params.get('amount'));

    setTimeout(() => {
      if (poRef) {
        setPoNumber(poRef);
        setInvoiceNumber(`INV-2024-${poRef.split('-')[2]}`);
      }

      if (vendorName) {
        const matchedVendor = vendors.find(v => v.name.toLowerCase().includes(vendorName.toLowerCase()));
        if (matchedVendor) {
          setSelectedVendorId(matchedVendor.id);
          
          // Auto populate email for modal
          setEmailDetails(prev => ({
            ...prev,
            to: matchedVendor.email,
            subject: `Purchase Order ${poRef || poNumber} Delivery Schedule`,
            body: `Dear ${matchedVendor.contactPerson},\n\nPlease find attached the official Purchase Order ${poRef || poNumber} matching our accepted quotation.\n\nWarm regards,\nProcurement Team`
          }));
        }
      }

      if (amount) {
        // Create line items matching amount
        setLineItems([
          { 
            name: 'Procured Sourcing Parts (Consolidated)', 
            description: `Deliverables matching ${poRef || 'sourcing request'} details.`,
            qty: 1, 
            unitPrice: Math.round(amount / (1 + taxRate / 100)), // Reverse calculate subtotal
            total: Math.round(amount / (1 + taxRate / 100))
          }
        ]);
      }
    }, 0);
  }, [location, vendors, taxRate, poNumber]);

  // Recalculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  const handleAddItem = () => {
    setLineItems([...lineItems, { name: '', description: '', qty: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...lineItems];
    
    if (field === 'qty') {
      updated[index].qty = parseInt(value) || 0;
    } else if (field === 'unitPrice') {
      updated[index].unitPrice = parseFloat(value) || 0;
    } else {
      updated[index][field] = value;
    }

    updated[index].total = updated[index].qty * updated[index].unitPrice;
    setLineItems(updated);
  };

  // Actions
  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    addToast(`Email invoice dispatch scheduled to ${emailDetails.to}`, 'success');
    setIsEmailModalOpen(false);
  };

  const handleSaveInvoice = () => {
    const payload = {
      invoiceNumber,
      poNumber,
      vendorId: selectedVendorId,
      vendorName: activeVendor?.name,
      billTo,
      items: lineItems,
      subtotal,
      taxPercentage: taxRate,
      taxAmount,
      grandTotal,
      paymentTerms,
      dueDate,
      notes
    };
    addInvoice(payload);
    addToast(`Invoice ${invoiceNumber} logged in local system storage.`, 'success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      
      {/* LEFT PANEL: INPUT FORM (Hidden in print) */}
      <div className="bg-slate-surface border border-slate-700 rounded-lg p-5 space-y-5 no-print">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
          <FileText className="w-4.5 h-4.5 text-indigo-400" /> Invoice Configuration Panel
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">PO Reference *</label>
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="w-full font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Invoice Number *</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full font-mono text-xs"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Select Sourced Supplier *</label>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full font-sans text-xs bg-[#0D1527] border border-slate-700"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Billing Office (Bill-To) *</label>
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
              className="w-full font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Payment SLA Terms</label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full text-xs bg-[#0D1527]"
            >
              <option value="Net 15 Days">Net 15 Days</option>
              <option value="Net 30 Days">Net 30 Days</option>
              <option value="Net 45 Days">Net 45 Days</option>
              <option value="Immediate">Immediate COD</option>
            </select>
          </div>
        </div>

        {/* Dynamic Items list */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-mono text-slate-400 uppercase">Billing Line Items</label>
            <button
              onClick={handleAddItem}
              className="border border-slate-700 hover:border-slate-500 bg-[#0D1527] px-2 py-0.5 rounded text-[11px] font-mono text-slate-300 flex items-center gap-0.5"
            >
              <Plus className="w-3.5 h-3.5" /> Item
            </button>
          </div>

          <div className="space-y-3.5">
            {lineItems.map((item, index) => (
              <div key={index} className="flex gap-2 items-start bg-[#0D1527] border border-slate-850 p-2.5 rounded relative">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    required
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    placeholder="Description name"
                    className="w-full py-1 text-xs"
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Technical comments"
                    className="w-full py-1 text-[11px]"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Quantity</span>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                        className="w-full py-0.5 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Unit Cost ($)</span>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-full py-0.5 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveItem(index)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-950/20 mt-1 shrink-0"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* GST Tax Selector */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Tax Surcharge Code (GST)</label>
            <select
              value={taxRate}
              onChange={(e) => setTaxRate(parseInt(e.target.value))}
              className="w-full text-xs bg-[#0D1527]"
            >
              <option value={5}>5% GST (Standard)</option>
              <option value={12}>12% GST (Services)</option>
              <option value={18}>18% GST (Heavy Machinery)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Footer Notes / Terms</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              className="w-full text-xs"
            />
          </div>
        </div>

        {/* Actions button */}
        <div className="pt-4 border-t border-slate-800 flex justify-between gap-2">
          <button
            onClick={handleSaveInvoice}
            className="flex-1 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-200 py-2 rounded text-xs font-mono font-medium uppercase transition-colors"
          >
            Save Record
          </button>
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="flex-1 bg-indigo-brand hover:bg-indigo-700 text-white py-2 rounded text-xs font-mono font-medium uppercase transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <Mail className="w-4 h-4" /> Send Email
          </button>
        </div>

      </div>

      {/* RIGHT PANEL: LIVE INVOICE PREVIEW (Targets print-area wrapper) */}
      <div className="space-y-4">
        
        {/* Helper Action buttons */}
        <div className="flex justify-end gap-2 no-print">
          <button
            onClick={handlePrint}
            className="bg-[#1E2640] hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-200 px-3.5 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 transition-all shadow-md"
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

        {/* A4 Live Invoice Document container */}
        <div className="bg-white text-slate-800 p-8 rounded shadow-2xl print-area mx-auto max-w-[210mm] min-h-[297mm] font-sans flex flex-col justify-between select-none">
          
          {/* Main Top Header Block */}
          <div className="space-y-6">
            
            {/* Header Letterhead */}
            <div className="flex justify-between items-start border-b-2 border-indigo-900 pb-5">
              <div>
                <div className="flex items-center gap-1 text-indigo-900 font-extrabold text-lg uppercase tracking-tight">
                  <img 
                    src="/vendorbridge_logo.png" 
                    alt="Logo" 
                    className="w-6 h-6 rounded object-cover mr-1" 
                  />
                  VendorBridge ERP
                </div>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono tracking-widest">COMMERCIAL PURCHASE SYSTEM</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold tracking-tight text-indigo-900 uppercase">COMMERCIAL BILLING</h2>
                <p className="font-mono text-xs text-slate-500 mt-0.5">PO REF: {poNumber}</p>
              </div>
            </div>

            {/* Billing Grid metadata */}
            <div className="grid grid-cols-2 gap-6 text-xs text-slate-600">
              
              {/* Left Column: Vendor Info */}
              <div className="space-y-2">
                <span className="block font-bold text-indigo-900 uppercase tracking-wide text-[10px]">SUPPLIER REMITTANCE</span>
                <div className="border-l-2 border-indigo-900/20 pl-3 space-y-1">
                  <p className="font-bold text-slate-800 text-sm uppercase">{activeVendor?.name || 'Optima Power Solutions'}</p>
                  <p className="font-mono text-[11px]">GST REG: {activeVendor?.gstNumber || '27AAOPS6789D1ZC'}</p>
                  <p>{activeVendor?.contactPerson || 'Jane Doe'} ({activeVendor?.email})</p>
                  <p className="max-w-[220px] leading-relaxed truncate">{activeVendor?.address || '100 Gridway Road, Austin, TX'}</p>
                </div>
              </div>

              {/* Right Column: Client info */}
              <div className="space-y-2">
                <span className="block font-bold text-indigo-900 uppercase tracking-wide text-[10px]">BILL TO OFFICE</span>
                <div className="border-l-2 border-slate-300 pl-3 space-y-1">
                  <p className="font-bold text-slate-800 text-sm uppercase">VENDORBRIDGE INDUSTRIES LTD</p>
                  <p className="leading-relaxed">{billTo}</p>
                  <div className="pt-1 text-[11px] grid grid-cols-2 gap-1 font-mono">
                    <div>
                      <span className="text-slate-500 block">BILLING ID</span>
                      <span className="font-bold text-slate-700">{invoiceNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">DUE DATE</span>
                      <span className="font-bold text-slate-700">{dueDate}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Line Items Matrix */}
            <div className="pt-4">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 text-indigo-900">
                    <th className="py-2.5 px-3 font-bold border-b-0 uppercase bg-transparent text-indigo-900">Item Specification Description</th>
                    <th className="py-2.5 px-3 font-bold border-b-0 uppercase bg-transparent text-indigo-900 text-right w-20">Qty</th>
                    <th className="py-2.5 px-3 font-bold border-b-0 uppercase bg-transparent text-indigo-900 text-right w-28">Unit Cost</th>
                    <th className="py-2.5 px-3 font-bold border-b-0 uppercase bg-transparent text-indigo-900 text-right w-28">Net Surcharge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-transparent bg-transparent">
                      <td className="py-3 px-3 border-b-0">
                        <p className="font-semibold text-slate-800">{item.name || 'Undefined Item Spec'}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.description || '-'}</p>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 border-b-0">{item.qty}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700 border-b-0">${item.unitPrice.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-800 font-semibold border-b-0">${item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculation Breakdowns */}
            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <div className="w-72 space-y-2 text-xs font-sans text-slate-600">
                <div className="flex justify-between">
                  <span>Net Sourced Subtotal:</span>
                  <span className="font-mono text-slate-800 font-semibold">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Surcharge ({taxRate}%):</span>
                  <span className="font-mono text-slate-800">${taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-350 pt-2 text-indigo-900 font-extrabold text-sm">
                  <span>TOTAL SURCHARGE DUE:</span>
                  <span className="font-mono text-base">${grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Bank Remittance Info */}
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

      {/* DISPATCH EMAIL MODAL */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
          <div className="w-full max-w-md bg-[#121A30] border border-slate-700 rounded-lg shadow-2xl p-5 font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-4">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4 text-indigo-400" /> Dispatch Commercial Invoice Document
              </span>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">To (Supplier Inbox) *</label>
                <input
                  type="email"
                  required
                  value={emailDetails.to}
                  onChange={(e) => setEmailDetails({ ...emailDetails, to: e.target.value })}
                  className="w-full text-xs"
                  placeholder="supplier@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Subject Header *</label>
                <input
                  type="text"
                  required
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
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-1.5 bg-transparent text-slate-400 hover:text-white font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-brand hover:bg-indigo-700 text-white font-mono text-xs uppercase rounded flex items-center gap-1 transition-colors"
                >
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
