import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, Legend
} from 'recharts';
import { 
  ArrowRight, Star, ThumbsUp 
} from 'lucide-react';

const Comparison = () => {
  const { vendors } = useApp();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [rfqs, setRfqs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [selectedRFQId, setSelectedRFQId] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await api.get('/api/rfqs?size=100');
        const allRfqs = res.data.items;
        setRfqs(allRfqs);
        if (allRfqs.length > 0) {
          setSelectedRFQId(allRfqs[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to fetch RFQs:', err);
      }
    };
    if (user) fetchInitial();
  }, [user]);

  useEffect(() => {
    const fetchComparisons = async () => {
      if (!selectedRFQId) return;
      setLoading(true);
      setRecommendation(null);
      try {
        // Fetch quotations
        const res = await api.get(`/api/rfqs/${selectedRFQId}/quotations?size=100`);
        setQuotations(res.data.items);

        // Fetch recommendation if 2 or more quotations
        if (res.data.items.length >= 2) {
          const recRes = await api.get(`/api/comparison/${selectedRFQId}/recommendation`);
          setRecommendation(recRes.data);
        }
      } catch (err) {
        console.error('Comparison fetch error:', err);
        if (err.response?.status !== 400 && err.response?.status !== 404) {
          addToast('Failed to fetch comparison data.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchComparisons();
  }, [selectedRFQId]);

  const currentRFQ = rfqs.find(r => r.id.toString() === selectedRFQId);

  const getVendorName = (vendorId) => {
    const v = vendors.find(v => v.id === vendorId);
    return v ? v.name : `Vendor #${vendorId}`;
  };

  const getVendorRating = (vendorId) => {
    const v = vendors.find(v => v.id === vendorId);
    return v ? parseFloat(v.rating || 4.0) : 4.0;
  };

  // Enhance quotations with vendor names and numbers
  const currentQuotations = quotations.map(q => ({
    ...q,
    vendorName: getVendorName(q.vendor_id),
    vendorRating: getVendorRating(q.vendor_id),
    grandTotal: parseFloat(q.grand_total),
    subtotal: parseFloat(q.subtotal),
    taxPercentage: parseFloat(q.tax_percent),
    deliveryTimeline: `${q.delivery_days} days`
  }));

  const recommendedQuotation = currentQuotations.find(q => 
    recommendation && q.vendorName === recommendation.recommended_vendor
  );

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const totals = currentQuotations.map(q => q.grandTotal);
  const minTotal = totals.length > 0 ? Math.min(...totals) : 0;
  const maxTotal = totals.length > 0 ? Math.max(...totals) : 0;

  const getRadarData = () => {
    if (currentQuotations.length === 0) return [];
    
    const parseDays = (q) => parseInt(q.delivery_days || 30);
    const deliveryDaysList = currentQuotations.map(parseDays);
    const maxDays = Math.max(...deliveryDaysList, 30);
    const minDays = Math.min(...deliveryDaysList, 5);

    const metrics = ['Price Index', 'Delivery Speed', 'Vendor Rating', 'Reliability Index'];
    
    return metrics.map(metric => {
      const dataPoint = { subject: metric };
      
      currentQuotations.forEach(q => {
        const ratingScore = q.vendorRating * 20; 
        let score = 70; 
        
        if (metric === 'Price Index') {
          if (maxTotal === minTotal) score = 90;
          else score = 100 - ((q.grandTotal - minTotal) / (maxTotal - minTotal)) * 50;
        } else if (metric === 'Delivery Speed') {
          const days = parseDays(q);
          if (maxDays === minDays) score = 90;
          else score = 100 - ((days - minDays) / (maxDays - minDays)) * 50;
        } else if (metric === 'Vendor Rating') {
          score = ratingScore;
        } else if (metric === 'Reliability Index') {
          score = Math.min(75 + (ratingScore - 80) * 0.5, 98);
        }
        dataPoint[q.vendorName] = Math.round(score);
      });
      return dataPoint;
    });
  };

  const radarData = getRadarData();

  const handleProceedWithVendor = async (quotation) => {
    try {
      // 1. Approve selected quotation using Approval Workflow API
      await api.post(`/api/approvals/${quotation.id}/approve`, { remarks: 'System Comparison Checkout' });

      // 2. Reject other quotations for this RFQ
      for (const q of currentQuotations) {
        if (q.id !== quotation.id && q.status !== 'REJECTED' && q.status !== 'ACCEPTED') {
          try {
            await api.post(`/api/approvals/${q.id}/reject`, { remarks: 'Not selected during comparison' });
          } catch (e) {
            console.error('Failed to reject sibling quote', q.id);
          }
        }
      }

      addToast(`Approved Selection: Proceeding with ${quotation.vendorName}. Created Approval workflow.`, 'success');
      navigate('/approvals');
    } catch (error) {
      if (error.response?.status === 403) {
        addToast('Permission denied: Only Admin or Manager can approve quotes.', 'error');
      } else {
        addToast('Failed to checkout and approve vendor.', 'error');
      }
    }
  };

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
            {rfqs.length === 0 && <option value="">No RFQs Available</option>}
            {rfqs.map((rfq) => (
              <option key={rfq.id} value={rfq.id}>
                {rfq.rfq_number} - {rfq.title}
              </option>
            ))}
          </select>
        </div>

        {recommendation && recommendedQuotation && (
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded p-3 text-xs flex items-center gap-2.5 max-w-md">
            <ThumbsUp className="w-5 h-5 text-emerald-400 shrink-0 animate-pulse" />
            <div>
              <p className="font-semibold text-emerald-400 font-mono uppercase tracking-wide text-[10px]">SYSTEM COMMERCIAL RECOMMENDATION</p>
              <p className="text-slate-300 mt-0.5">Proceed with <strong>{recommendation.recommended_vendor}</strong>. {recommendation.reason} ({recommendation.score} pts).</p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-slate-surface border border-slate-700 p-12 text-center text-slate-500 font-mono text-xs rounded">
          LOADING BID COMPARISONS...
        </div>
      ) : currentQuotations.length === 0 ? (
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
                          <span className="text-[10px] text-slate-500">Quote #{q.id}</span>
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
                      return (
                        <td key={q.id} className="text-center font-mono text-xs">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-current text-amber-warning" />
                            <span className="font-bold text-white">{q.vendorRating.toFixed(1)} / 5.0</span>
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
                        Standard Net 30
                      </td>
                    ))}
                  </tr>

                  {/* Warranty Notes */}
                  <tr>
                    <td className="font-semibold text-slate-400">Warranty Coverage / Notes</td>
                    {currentQuotations.map((q) => (
                      <td key={q.id} className="text-center text-xs text-slate-400 max-w-[200px] truncate" title={q.remarks}>
                        {q.remarks || 'No notes'}
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
