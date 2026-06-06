import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, ShieldAlert, CheckCircle, Info } from 'lucide-react';

const Topbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Derive page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'ERP SYSTEM CONTROL';
    if (path === '/vendors') return 'VENDOR DIRECTORY';
    if (path === '/rfq') return 'RFQ CONTROL CENTER';
    if (path === '/quotations') return 'QUOTATION ANALYSIS';
    if (path === '/comparison') return 'COMMERCIAL COMPARISON MATRIX';
    if (path === '/approvals') return 'APPROVAL WORKFLOW WORKSPACE';
    if (path === '/invoice') return 'INVOICE & PO MANAGEMENT';
    return 'ERP PLATFORM';
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="bg-red-950/40 text-rose-400 border border-rose-800/40 badge-status font-mono">SYS-ADMIN</span>;
      case 'procurement_officer':
        return <span className="bg-indigo-950/40 text-indigo-400 border border-indigo-800/40 badge-status font-mono">PROCUR-OFFICER</span>;
      case 'manager':
        return <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 badge-status font-mono">EXEC-MANAGER</span>;
      case 'vendor':
        return <span className="bg-amber-950/40 text-amber-warning border border-amber-800/40 badge-status font-mono">SUPPLIER-PORTAL</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 badge-status font-mono">{role}</span>;
    }
  };

  // Static mock notifications
  const notifications = [
    { id: 1, type: 'info', message: 'Apex Manufacturing submitted a new bid for RFQ-2024-001.', time: '10m ago' },
    { id: 2, type: 'success', message: 'Purchase Order PO-2024-0051 approved by Executive Manager.', time: '1h ago' },
    { id: 3, type: 'warning', message: 'RFQ-2024-003 is missing assignees. Review pending drafts.', time: '4h ago' }
  ];

  return (
    <header className="h-16 bg-[#0E1527] border-b border-slate-700 flex items-center justify-between px-6 sticky top-0 z-20 no-print">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="font-mono text-base font-bold text-white uppercase tracking-wider">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* User Role Badge */}
        {user && getRoleBadge(user.role)}

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1E2640] rounded-md transition-colors relative border border-transparent hover:border-slate-700"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-brand rounded-full ring-2 ring-[#0E1527]"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowNotifications(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-80 bg-[#121A30] border border-slate-700 rounded-lg shadow-2xl z-40 py-2 font-sans overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                  <span className="text-xs font-bold font-mono tracking-wider uppercase text-slate-300">SYSTEM ALERTS</span>
                  <span className="text-[10px] text-indigo-400 font-mono">3 NEW</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 hover:bg-[#1A233D] border-b border-slate-800 last:border-0 flex items-start gap-3">
                      {n.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />}
                      {n.type === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-warning mt-0.5 shrink-0" />}
                      {n.type === 'info' && <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-200 leading-normal">{n.message}</p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
