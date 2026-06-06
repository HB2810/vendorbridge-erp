import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Key, Mail, Building, Phone, User, Landmark } from 'lucide-react';

const Register = () => {
  const { addVendor } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('Manufacturing');
  const [gstNumber, setGstNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('vendor'); // vendor, procurement_officer
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Field checks
    if (!companyName.trim() || !gstNumber.trim() || !contactName.trim() || !email.trim() || !password.trim()) {
      setError('Please populate all required fields marked with *');
      addToast('Validation Failed: Missing required fields.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      addToast('Validation Failed: Passwords must match.', 'error');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      addToast('Validation Failed: Password too short.', 'error');
      return;
    }

    try {
      // If registering as vendor, register profile in AppContext
      if (selectedRole === 'vendor') {
        addVendor({
          name: companyName,
          category,
          gstNumber,
          contactPerson: contactName,
          email,
          phone,
          address: 'Pending registration audit',
          status: 'Active',
          rating: 5.0,
          ratingHistory: [{ date: new Date().toISOString().split('T')[0], rating: 5.0, comment: 'Registered via Supplier Portal' }],
          pastPOs: []
        });
      }

      addToast('Profile Registration successful! You can now authenticate.', 'success');
      navigate('/login');
    } catch {
      setError('Registration failed. Try again.');
      addToast('Error during profile registration.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-mesh relative px-4 py-8 overflow-hidden">
      {/* Modern Soft Ambient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-lg bg-white/90 border border-slate-200 rounded-lg shadow-[0_0_40px_rgba(37,99,235,0.06)] backdrop-blur-md p-8 relative z-10">
        
        {/* Logo and Branding */}
        <div className="text-center mb-6">
          <img 
            src="/vendorbridge_logo.png" 
            alt="VendorBridge Logo" 
            className="w-12 h-12 rounded mx-auto mb-3 object-cover border border-slate-200/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]" 
          />
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans uppercase">VendorBridge</h2>
          <p className="text-xs text-gray-secondary tracking-widest font-mono uppercase mt-1">Register Sourcing Credentials</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded text-rose-600 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-slate-500 uppercase mb-1.5">Company Legal Name *</label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Apex Industrial Solutions"
                  className="w-full pl-9 pr-4 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-500 uppercase mb-1.5">GST Registration Number *</label>
              <div className="relative">
                <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="27AAPCA1234F1Z0"
                  className="w-full pl-9 pr-4 py-2 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-500 uppercase mb-1.5">Primary Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2 bg-white"
              >
                <option value="Manufacturing">Manufacturing</option>
                <option value="Logistics">Logistics</option>
                <option value="IT Support">IT Support</option>
                <option value="Consultancy">Consultancy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-500 uppercase mb-1.5">Contact Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-4 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-500 uppercase mb-1.5">Business Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sourcing@company.com"
                  className="w-full pl-9 pr-4 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-500 uppercase mb-1.5">Contact Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-4 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-500 uppercase mb-1.5">Access Password *</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-slate-500 uppercase mb-1.5">Confirm Password *</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2"
                />
              </div>
            </div>
          </div>

          {/* Role selector */}
          <div className="pt-2 border-t border-slate-200">
            <span className="block text-[11px] font-mono font-medium text-slate-500 uppercase mb-2">Select Account Role Credentials</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'vendor', label: 'Supplier Portal' },
                { id: 'procurement_officer', label: 'Procurement Officer' }
              ].map((role) => (
                <label
                  key={role.id}
                  className={`flex items-center justify-center gap-2 px-3 py-1.5 border rounded cursor-pointer transition-all ${
                    selectedRole === role.id
                      ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    checked={selectedRole === role.id}
                    onChange={() => setSelectedRole(role.id)}
                    className="sr-only"
                  />
                  <span className="text-xs font-mono">{role.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors text-sm uppercase tracking-wider font-mono shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
          >
            Register Profile
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 font-sans">
            Already have an active account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
