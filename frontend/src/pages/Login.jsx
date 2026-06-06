import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Key, Mail } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [error, setError] = useState('');

  // Handle role changes manually without pre-filling credentials
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password fields are required.');
      addToast('Validation Failed: Please fill in all fields.', 'error');
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        addToast('Successfully authenticated', 'success');
        navigate('/dashboard');
      } else {
        setError('Authentication failed. Check your inputs.');
        addToast('Login Failed: Invalid credentials.', 'error');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Check your inputs.');
      addToast('Login Failed: Invalid credentials.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-mesh relative px-4 overflow-hidden">
      {/* Modern Soft Ambient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white/90 border border-slate-200 rounded-lg shadow-[0_0_40px_rgba(37,99,235,0.06)] backdrop-blur-md p-8 relative z-10">
        
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <img 
            src="/vendorbridge_logo.png" 
            alt="VendorBridge Logo" 
            className="w-12 h-12 rounded mx-auto mb-3 object-cover border border-slate-200/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]" 
          />
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans uppercase">VendorBridge</h2>
          <p className="text-xs text-gray-secondary tracking-widest font-mono uppercase mt-1">Enterprise Procurement ERP</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/40 rounded text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1.5">Security Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                autoComplete="off"
                className="w-full pl-9 pr-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-400 uppercase mb-1.5">Access Password</label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full pl-9 pr-4 py-2"
              />
            </div>
          </div>

          {/* Role selector for demo switching */}
          <div className="pt-2 border-t border-slate-800">
            <span className="block text-[11px] font-mono font-medium text-slate-500 uppercase mb-2">Select Account Role (Demo Access Mode)</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'admin', label: 'Sys Admin' },
                { id: 'procurement_officer', label: 'Officer' },
                { id: 'vendor', label: 'Supplier' },
                { id: 'manager', label: 'Manager' }
              ].map((role) => (
                <label
                  key={role.id}
                  className={`flex items-center gap-2 px-3 py-1.5 border rounded cursor-pointer transition-all ${
                    selectedRole === role.id
                      ? 'border-indigo-brand bg-indigo-950/20 text-indigo-400 font-semibold'
                      : 'border-slate-800 bg-[#0E1527] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    checked={selectedRole === role.id}
                    onChange={() => handleRoleChange(role.id)}
                    className="sr-only"
                  />
                  <span className="text-xs font-mono">{role.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-indigo-brand hover:bg-indigo-700 text-white font-medium py-2 rounded transition-colors text-sm uppercase tracking-wider font-mono shadow-[0_4px_12px_rgba(79,70,229,0.25)]"
          >
            Authenticate Portal
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 font-sans">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold underline">
              Register Profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
