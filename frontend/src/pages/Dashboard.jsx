import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Users, FileText, CheckSquare, DollarSign,
  ArrowUpRight, ArrowDownRight, Plus, ExternalLink
} from 'lucide-react';

const Dashboard = () => {
  const { vendors, rfqs, approvals, updateApproval } = useApp();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_vendors: 0,
    active_vendors: 0,
    active_rfqs: 0,
    pending_approvals: 0,
    total_purchase_orders: 0,
    total_invoices: 0,
    total_procurement_value: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (user && user.role !== 'vendor') {
        try {
          const response = await api.get('/api/dashboard/stats');
          setStats(response.data);
        } catch (error) {
          console.error('Failed to fetch dashboard stats:', error);
          addToast('Failed to load dashboard metrics from server.', 'error');
        }
      }
      setLoadingStats(false);
    };
    fetchStats();
  }, [user]);

  // Dynamic values mapped from API response
  const totalVendors = user?.role === 'vendor' ? vendors.length : stats.total_vendors;
  const activeRFQs = user?.role === 'vendor' ? rfqs.length : stats.active_rfqs;
  const pendingApprovalsCount = user?.role === 'vendor' ? 0 : stats.pending_approvals;
  const totalPOValue = user?.role === 'vendor' ? 0 : stats.total_procurement_value;

  // Render monetary fields
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Recharts: Spend Data (Bar Chart)
  const spendData = [
    { month: 'Jan', spend: 45000 },
    { month: 'Feb', spend: 128000 },
    { month: 'Mar', spend: 95000 },
    { month: 'Apr', spend: 110000 },
    { month: 'May', spend: 154000 },
    { month: 'Jun', spend: 100300 }
  ];

  // Recharts: Category Data (Donut Chart)
  const categoryCounts = vendors.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    value: categoryCounts[cat]
  }));

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  // Handle Quick Approval inline
  const handleApproveInline = (id, ref) => {
    updateApproval(id, 'Approved', 'Approved via Dashboard Quick Action.', user?.name || 'System Officer');
    addToast(`Approved request ${ref}`, 'success');
  };

  const handleRejectInline = (id, ref) => {
    updateApproval(id, 'Rejected', 'Rejected via Dashboard Quick Action.', user?.name || 'System Officer');
    addToast(`Rejected request ${ref}`, 'error');
  };

  return (
    <div className="space-y-6">
      
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Vendors */}
        <div className="bg-slate-surface border-l-4 border-indigo-brand border-slate-700 p-4 rounded shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-medium text-gray-secondary uppercase">Total Suppliers</span>
            <h3 className="text-2xl font-bold font-mono mt-1 text-white">{totalVendors}</h3>
            <span className="text-[10px] text-emerald-400 flex items-center font-mono mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +12.4% vs LMY
            </span>
          </div>
          <div className="p-2.5 bg-indigo-950/40 rounded border border-indigo-900/30">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Active RFQs */}
        <div className="bg-slate-surface border-l-4 border-indigo-brand border-slate-700 p-4 rounded shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-medium text-gray-secondary uppercase">Active RFQs</span>
            <h3 className="text-2xl font-bold font-mono mt-1 text-white">{activeRFQs}</h3>
            <span className="text-[10px] text-emerald-400 flex items-center font-mono mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +5.0% this wk
            </span>
          </div>
          <div className="p-2.5 bg-indigo-950/40 rounded border border-indigo-900/30">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-slate-surface border-l-4 border-amber-warning border-slate-700 p-4 rounded shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-medium text-gray-secondary uppercase">Pending Approvals</span>
            <h3 className="text-2xl font-bold font-mono mt-1 text-white">{pendingApprovalsCount}</h3>
            <span className="text-[10px] text-amber-warning flex items-center font-mono mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Requires Action
            </span>
          </div>
          <div className="p-2.5 bg-amber-950/40 rounded border border-amber-900/30">
            <CheckSquare className="w-5 h-5 text-amber-warning" />
          </div>
        </div>

        {/* Total PO Value */}
        <div className="bg-slate-surface border-l-4 border-emerald-500 border-slate-700 p-4 rounded shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-medium text-gray-secondary uppercase">Total PO Volume</span>
            <h3 className="text-2xl font-bold font-mono mt-1 text-white">{formatCurrency(totalPOValue)}</h3>
            <span className="text-[10px] text-rose-500 flex items-center font-mono mt-1">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> -2.1% MoM
            </span>
          </div>
          <div className="p-2.5 bg-emerald-950/40 rounded border border-emerald-900/30">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Spend history bar chart */}
        <div className="bg-slate-surface border border-slate-700 p-4 rounded shadow-md">
          <div className="mb-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Spend Volume History (USD)</h4>
            <p className="text-xs text-gray-secondary">Direct procurement spending across consecutive monthly ranges.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121A30', borderColor: '#334155', borderRadius: '4px' }}
                  labelStyle={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '11px' }}
                  itemStyle={{ color: '#E2E8F0', fontFamily: 'monospace', fontSize: '12px' }}
                  formatter={(value) => [formatCurrency(value), 'Spend']}
                />
                <Bar dataKey="spend" fill="#4F46E5" radius={[2, 2, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor category pie chart */}
        <div className="bg-slate-surface border border-slate-700 p-4 rounded shadow-md">
          <div className="mb-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Vendor Category Allocation</h4>
            <p className="text-xs text-gray-secondary">Share of active commercial suppliers by sector category.</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#121A30', borderColor: '#334155', borderRadius: '4px' }}
                  itemStyle={{ color: '#E2E8F0', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconSize={10} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent RFQs */}
        <div className="bg-slate-surface border border-slate-700 rounded shadow-md overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Active RFQ Operations</h4>
              <button 
                onClick={() => navigate('/rfq')}
                className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Go to RFQs <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>RFQ ID</th>
                    <th>RFQ Subject / Title</th>
                    <th>Status</th>
                    <th>Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.slice(0, 4).map((rfq) => (
                    <tr key={rfq.id}>
                      <td className="font-mono text-xs text-indigo-400 font-bold">{rfq.id}</td>
                      <td className="font-semibold truncate max-w-[180px]">{rfq.title}</td>
                      <td>
                        <span className={`badge-status ${
                          rfq.status === 'Sent' ? 'bg-indigo-950/50 text-indigo-400 border-indigo-800/40' : 
                          rfq.status === 'Closed' ? 'bg-slate-900 text-slate-500 border-slate-800' :
                          'bg-amber-950/50 text-amber-warning border-amber-800/40'
                        }`}>
                          {rfq.status}
                        </span>
                      </td>
                      <td className="font-mono text-xs">{rfq.deadline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-slate-surface border border-slate-700 rounded shadow-md overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Awaiting Executive Approval</h4>
              <button 
                onClick={() => navigate('/approvals')}
                className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Go to Approvals <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Contract Vendor</th>
                    <th>Contract Value</th>
                    <th>Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.filter(a => a.status === 'Pending').length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-xs text-slate-500 font-mono">
                        NO PENDING APPROVAL REQUESTS REGISTERED
                      </td>
                    </tr>
                  ) : (
                    approvals.filter(a => a.status === 'Pending').slice(0, 4).map((app) => (
                      <tr key={app.id}>
                        <td className="font-mono text-xs text-slate-200">{app.poReference}</td>
                        <td className="truncate max-w-[140px] font-semibold">{app.vendorName}</td>
                        <td className="font-mono text-xs text-white">{formatCurrency(app.amount)}</td>
                        <td>
                          {user?.role === 'manager' || user?.role === 'admin' ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleApproveInline(app.id, app.poReference)}
                                className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded text-[11px] font-mono transition-colors"
                              >
                                Appr
                              </button>
                              <button
                                onClick={() => handleRejectInline(app.id, app.poReference)}
                                className="bg-rose-950 hover:bg-rose-900 border border-rose-800/50 text-rose-400 px-2 py-0.5 rounded text-[11px] font-mono transition-colors"
                              >
                                Rej
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">No Auth</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Row 4: Quick Actions */}
      <div className="bg-slate-surface border border-slate-700 p-4 rounded shadow-md">
        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">Quick Navigation Terminals</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          <button 
            onClick={() => navigate('/rfq')}
            disabled={user?.role === 'vendor' || user?.role === 'manager'}
            className="flex items-center justify-between p-3.5 bg-[#0D1527] border border-slate-700 hover:border-indigo-brand rounded text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700"
          >
            <div>
              <span className="block text-xs font-mono font-semibold text-slate-300">NEW RFQ DRAFT</span>
              <span className="text-[10px] text-gray-secondary mt-0.5 block">Create client sourcing ticket</span>
            </div>
            <Plus className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
          </button>

          <button 
            onClick={() => navigate('/vendors')}
            disabled={user?.role === 'vendor'}
            className="flex items-center justify-between p-3.5 bg-[#0D1527] border border-slate-700 hover:border-indigo-brand rounded text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700"
          >
            <div>
              <span className="block text-xs font-mono font-semibold text-slate-300">ADD VENDOR PROFILE</span>
              <span className="text-[10px] text-gray-secondary mt-0.5 block">Register active supply partner</span>
            </div>
            <Plus className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
          </button>

          <button 
            onClick={() => navigate('/quotations')}
            className="flex items-center justify-between p-3.5 bg-[#0D1527] border border-slate-700 hover:border-indigo-brand rounded text-left transition-all group"
          >
            <div>
              <span className="block text-xs font-mono font-semibold text-slate-300">REVIEW QUOTATIONS</span>
              <span className="text-[10px] text-gray-secondary mt-0.5 block">Process pending vendor tenders</span>
            </div>
            <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
          </button>

          <button 
            onClick={() => navigate('/invoice')}
            className="flex items-center justify-between p-3.5 bg-[#0D1527] border border-slate-700 hover:border-indigo-brand rounded text-left transition-all group"
          >
            <div>
              <span className="block text-xs font-mono font-semibold text-slate-300">GENERATE INVOICE</span>
              <span className="text-[10px] text-gray-secondary mt-0.5 block">Compile billings and PO metrics</span>
            </div>
            <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
          </button>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
