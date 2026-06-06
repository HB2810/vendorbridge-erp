import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  GitCompare, 
  CheckSquare, 
  Receipt, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'procurement_officer', 'vendor', 'manager'] },
    { path: '/vendors', label: 'Vendors', icon: Users, roles: ['admin', 'procurement_officer', 'manager'] },
    { path: '/rfq', label: 'RFQs', icon: FileText, roles: ['admin', 'procurement_officer', 'manager'] },
    { path: '/quotations', label: 'Quotations', icon: MessageSquare, roles: ['admin', 'procurement_officer', 'vendor'] },
    { path: '/comparison', label: 'Comparison', icon: GitCompare, roles: ['admin', 'procurement_officer', 'manager'] },
    { path: '/approvals', label: 'Approvals', icon: CheckSquare, roles: ['admin', 'manager'] },
    { path: '/invoice', label: 'Invoices & PO', icon: Receipt, roles: ['admin', 'procurement_officer', 'vendor', 'manager'] }
  ];

  // Filter items based on user role
  const allowedItems = navItems.filter(item => 
    !user || item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Bottom Navigation (sm screens only) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-navy-light border-t border-slate-700 z-40 flex justify-around items-center px-2 md:hidden no-print">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center py-1 px-3 text-xs font-medium transition-colors ${
                  isActive 
                    ? 'text-indigo-400 border-t-2 border-indigo-brand font-semibold' 
                    : 'text-gray-secondary hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="scale-90">{item.label}</span>
            </NavLink>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center py-1 px-3 text-xs font-medium text-rose-400 hover:text-rose-300"
        >
          <LogOut className="w-5 h-5 mb-0.5" />
          <span className="scale-90">Logout</span>
        </button>
      </div>

      {/* Desktop Sidebar (md screens and above) */}
      <aside 
        className={`hidden md:flex flex-col bg-navy-light border-r border-slate-700 h-screen transition-all duration-300 ease-in-out shrink-0 sticky top-0 z-30 no-print ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-700">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-brand rounded flex items-center justify-center font-bold text-white tracking-wider text-sm">
                VB
              </div>
              <span className="font-bold tracking-tight text-white text-base">VendorBridge</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-7 h-7 mx-auto bg-indigo-brand rounded flex items-center justify-center font-bold text-white tracking-wider text-sm">
              VB
            </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-secondary hover:text-white p-1 rounded hover:bg-[#1E293B]"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all rounded-md ${
                    isActive 
                      ? 'bg-[#1E2640] border-l-4 border-indigo-brand text-indigo-400 font-semibold' 
                      : 'text-gray-secondary hover:bg-[#11182D] hover:text-white border-l-4 border-transparent'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        {user && (
          <div className="p-4 border-t border-slate-700 bg-[#0B1123] flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img 
                src={user.avatarUrl} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600"
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">{user.name}</p>
                  <p className="text-xs text-gray-secondary truncate">{user.email}</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-1.5 border border-slate-700 hover:border-rose-500/50 hover:bg-rose-950/20 text-xs font-mono text-rose-400 rounded transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out Session
              </button>
            )}
            {isCollapsed && (
              <button
                onClick={handleLogout}
                className="mx-auto p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-[#1A1120]"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
