import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, Legend
} from 'recharts';
import { 
  ArrowRight, Star, ThumbsUp 
} from 'lucide-react';

const generatePORef = () => `PO-2024-00${Math.floor(10 + Math.random() * 90)}`;

const Comparison = () => {
  const { rfqs, quotations, vendors, addApproval, approvals, updateQuotationStatus } = useApp();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Filter RFQs that have quotations
  const rfqOptions = rfqs.filter(r => quotations.some(q => q.rfqId === r.id));
  const [selectedRFQId, setSelectedRFQId] = useState(rfqOptions[0]?.id || 'RFQ-2024-001');

  const currentRFQ = rfqs.find(r => r.id === selectedRFQId);
  const currentQuotations = quotations.filter(q => q.rfqId === selectedRFQId);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Find lowest and highest grand total for highlighting
  const totals = currentQuotations.map(q => q.grandTotal);
  const minTotal = Math.min(...totals);
  const maxTotal = Math.max(...totals);

  // Find recommended vendor (lowest total price)
  const recommendedQuotation = currentQuotations.reduce((best, curr) => {
    if (!best) return curr;
    return curr.grandTotal < best.grandTotal ? curr : best;
  }, null);

  // Generate Radar Chart Data
  // Axis: Price (low price = high score), Speed (fast delivery = high score), Rating (0-100), Reliability (mock index)
  const getRadarData = () => {
    if (currentQuotations.length === 0) return [];
    
    // Parse delivery days
    const parseDays = (timelineStr) => {
      const num = parseInt(timelineStr);
      return isNaN(num) ? 30 : num;
    };

    const deliveryDaysList = currentQuotations.map(q => parseDays(q.deliveryTimeline));
    const maxDays = Math.max(...deliveryDaysList, 30);
    const minDays = Math.min(...deliveryDaysList, 5);

    const metrics = ['Price Index', 'Delivery Speed', 'Vendor Rating', 'Reliability Index'];
    
    return metrics.map(metric => {
      const dataPoint = { subject: metric };
      
      currentQuotations.forEach(q => {
        const vendorInfo = vendors.find(v => v.id === q.vendorId);
        const ratingScore = (vendorInfo?.rating || q.vendorRating || 4.0) * 20; // Scale 0-5 to 0-100
        
        let score = 70; // default baseline score
        
        if (metric === 'Price Index') {
          // Normalize price score (lowest price = 100, highest price = 50)
          if (maxTotal === minTotal) {
            score = 90;
          } else {
            score = 100 - ((q.grandTotal - minTotal) / (maxTotal - minTotal)) * 50;
          }
        } else if (metric === 'Delivery Speed') {
          const days = parseDays(q.deliveryTimeline);
          if (maxDays === minDays) {
            score = 90;
          } else {
            score = 100 - ((days - minDays) / (maxDays - minDays)) * 50;
          }
        } else if (metric === 'Vendor Rating') {
          score = ratingScore;
        } else if (metric === 'Reliability Index') {
          // Calculate mock reliability index using rating + past PO count
          const poCount = vendorInfo?.pastPOs?.length || 0;
          score = Math.min(75 + poCount * 5 + (ratingScore - 80) * 0.5, 98);
        }

        dataPoint[q.vendorName] = Math.round(score);
      });
      
      return dataPoint;
    });
  };

  const radarData = getRadarData();

  const handleProceedWithVendor = (quotation) => {
    // 1. Set selected quotation to 'Accepted'
    updateQuotationStatus(quotation.id, 'Accepted');

    // 2. Set other quotations for this RFQ to 'Rejected'
    currentQuotations.forEach(q => {
      if (q.id !== quotation.id) {
        updateQuotationStatus(q.id, 'Rejected');
      }
    });

    // 3. Create Approval instance if not already existing
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
        remarks: `Initiated comparison checkout. Proceeding with recommended vendor ${quotation.vendorName}.`
      });
    }

    addToast(`Approved Selection: Proceeding with ${quotation.vendorName}. Created Approval workflow.`, 'success');
    navigate('/approvals');
  };

  // Radar colors mapping
  const radarColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      
      {/* Selector dropdown header */}
      <div className="bg-slate-surface border border-slate-700 p-4 rounded shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase mb-1.5">Select Sourcing Inquiry</label>
          <select
            value={selectedRFQId}
            onChange={(e) => setSelectedRFQId(e.target.value)}
            className="w-full md:w-80 font-mono text-xs bg-[#0D1527] border border-slate-700"
          >
            {rfqOptions.map((rfq) => (
              <option key={rfq.id} value={rfq.id}>
                {rfq.id} - {rfq.title}
              </option>
            ))}
          </select>
        </div>

        {recommendedQuotation && (
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded p-3 text-xs flex items-center gap-2.5 max-w-md">
            <ThumbsUp className="w-5 h-5 text-emerald-400 shrink-0 animate-pulse" />
            <div>
              <p className="font-semibold text-emerald-400 font-mono uppercase tracking-wide text-[10px]">SYSTEM COMMERCIAL RECOMMENDATION</p>
              <p className="text-slate-300 mt-0.5">Proceed with <strong>{recommendedQuotation.vendorName}</strong> due to lowest cost index ({formatCurrency(recommendedQuotation.grandTotal)}).</p>
            </div>
          </div>
        )}
      </div>

      {currentQuotations.length === 0 ? (
        <div className="bg-slate-surface border border-slate-700 p-12 text-center text-slate-500 font-mono text-xs rounded">
          NO BID COMPARISONS AVAILABLE. BROADCAST AN RFQ AND SECURE SUBMISSIONS FIRST.
        </div>
      ) : (
        <>
          {/* COMPARISON MATRIX TABLE */}
          <div className="bg-slate-surface border border-slate-700 rounded shadow-md overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Side-by-Side Sourcing Evaluation Matrix</h4>
            </div>
            
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th className="min-w-[180px]">Evaluation Criteria</th>
                    {currentQuotations.map((q) => {
                      const isBest = recommendedQuotation && q.id === recommendedQuotation.id;
                      return (
                        <th key={q.id} className="text-center font-mono relative">
                          <span className="block text-slate-200 font-semibold font-sans">{q.vendorName}</span>
                          <span className="text-[10px] text-slate-500">{q.id}</span>
                          {isBest && (
                            <span className="absolute top-0 right-0 bg-emerald-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-bl tracking-widest uppercase">
                              RECOMMENDED
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  
                  {/* Rating */}
                  <tr>
                    <td className="font-semibold text-slate-400">Supplier Quality Score</td>
                    {currentQuotations.map((q) => {
                      const vendorDetails = vendors.find(v => v.id === q.vendorId);
                      return (
                        <td key={q.id} className="text-center font-mono text-xs">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-current text-amber-warning" />
                            <span className="font-bold text-white">{vendorDetails?.rating.toFixed(1) || '4.0'} / 5.0</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Subtotal */}
                  <tr>
                    <td className="font-semibold text-slate-400">Items Net Cost (Subtotal)</td>
                    {currentQuotations.map((q) => (
                      <td key={q.id} className="text-center font-mono text-xs text-slate-200">
                        {formatCurrency(q.subtotal)}
                      </td>
                    ))}
                  </tr>

                  {/* Tax */}
                  <tr>
                    <td className="font-semibold text-slate-400">Tax Surcharge (GST %)</td>
                    {currentQuotations.map((q) => (
                      <td key={q.id} className="text-center font-mono text-xs text-slate-300">
                        {q.taxPercentage}% GST
                      </td>
                    ))}
                  </tr>

                  {/* Grand Total */}
                  <tr className="bg-[#121A30]/40">
                    <td className="font-bold text-slate-300 font-mono text-xs uppercase">Grand Total (Sourcing Cost)</td>
                    {currentQuotations.map((q) => {
                      const isMin = q.grandTotal === minTotal;
                      const isMax = q.grandTotal === maxTotal;
                      return (
                        <td 
                          key={q.id} 
                          className={`text-center font-mono font-bold text-sm ${
                            isMin ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/20' : 
                            isMax ? 'bg-rose-950/30 text-rose-400 border border-rose-800/20' : 
                            'text-white'
                          }`}
                        >
                          {formatCurrency(q.grandTotal)}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Delivery timeline */}
                  <tr>
                    <td className="font-semibold text-slate-400">Delivery Lead Timeline</td>
                    {currentQuotations.map((q) => {
                      // Highlight fastest delivery (we can parse number)
                      const isFastest = q.deliveryTimeline === currentQuotations.reduce((best, curr) => 
                        parseInt(curr.deliveryTimeline) < parseInt(best.deliveryTimeline) ? curr : best
                      ).deliveryTimeline;

                      return (
                        <td 
                          key={q.id} 
                          className={`text-center font-mono text-xs ${
                            isFastest ? 'text-emerald-400 bg-emerald-950/20' : 'text-slate-300'
                          }`}
                        >
                          {q.deliveryTimeline}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Payment Terms */}
                  <tr>
                    <td className="font-semibold text-slate-400">Payment Terms Agreement</td>
                    {currentQuotations.map((q) => (
                      <td key={q.id} className="text-center text-xs text-slate-300">
                        {q.paymentTerms}
                      </td>
                    ))}
                  </tr>

                  {/* Warranty Notes */}
                  <tr>
                    <td className="font-semibold text-slate-400">Warranty Coverage / Notes</td>
                    {currentQuotations.map((q) => (
                      <td key={q.id} className="text-center text-xs text-slate-400 max-w-[200px] truncate" title={q.warrantyNotes}>
                        {q.warrantyNotes}
                      </td>
                    ))}
                  </tr>

                  {/* Checkout CTA */}
                  {user?.role !== 'vendor' && (
                    <tr className="bg-[#0B1123]/80 hover:bg-transparent">
                      <td className="border-0"></td>
                      {currentQuotations.map((q) => {
                        const isBest = recommendedQuotation && q.id === recommendedQuotation.id;
                        return (
                          <td key={q.id} className="text-center border-0 py-4">
                            <button
                              onClick={() => handleProceedWithVendor(q)}
                              className={`font-mono text-xs uppercase px-4 py-1.5 rounded transition-all shadow-md inline-flex items-center gap-1.5 ${
                                isBest 
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold' 
                                  : 'bg-[#1E2640] hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              Proceed <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>

          {/* RADAR ANALYTICS CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <div className="bg-slate-surface border border-slate-700 p-4 rounded shadow-md">
              <div className="mb-4">
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Multi-Criteria Radar Performance Index</h4>
                <p className="text-xs text-gray-secondary">Radar index maps normalized metrics (higher value indicates superior performance).</p>
              </div>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#64748B" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" style={{ fontSize: '10px' }} />
                    
                    {currentQuotations.map((q, index) => (
                      <Radar
                        key={q.id}
                        name={q.vendorName}
                        dataKey={q.vendorName}
                        stroke={radarColors[index % radarColors.length]}
                        fill={radarColors[index % radarColors.length]}
                        fillOpacity={0.25}
                      />
                    ))}
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', color: '#94A3B8' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default Comparison;
