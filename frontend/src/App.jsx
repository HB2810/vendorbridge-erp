import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import Sidebar from './components/Layout/Sidebar';
import Topbar from './components/Layout/Topbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import RFQ from './pages/RFQ';
import Quotations from './pages/Quotations';
import Comparison from './pages/Comparison';
import Approvals from './pages/Approvals';
import Invoice from './pages/Invoice';

// Auth Guard Wrapper
const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect unauthenticated user to login screen
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Layout Shell Wrapper
const LayoutShell = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-navy-dark text-slate-100 relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto pb-24 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <AuthGuard>
          <LayoutShell>
            <Dashboard />
          </LayoutShell>
        </AuthGuard>
      } />

      <Route path="/vendors" element={
        <AuthGuard>
          <LayoutShell>
            <Vendors />
          </LayoutShell>
        </AuthGuard>
      } />

      <Route path="/rfq" element={
        <AuthGuard>
          <LayoutShell>
            <RFQ />
          </LayoutShell>
        </AuthGuard>
      } />

      <Route path="/quotations" element={
        <AuthGuard>
          <LayoutShell>
            <Quotations />
          </LayoutShell>
        </AuthGuard>
      } />

      <Route path="/comparison" element={
        <AuthGuard>
          <LayoutShell>
            <Comparison />
          </LayoutShell>
        </AuthGuard>
      } />

      <Route path="/approvals" element={
        <AuthGuard>
          <LayoutShell>
            <Approvals />
          </LayoutShell>
        </AuthGuard>
      } />

      <Route path="/invoice" element={
        <AuthGuard>
          <LayoutShell>
            <Invoice />
          </LayoutShell>
        </AuthGuard>
      } />

      {/* Wildcard Fallbacks */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
