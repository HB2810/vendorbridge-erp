/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Sync session with localStorage to persist login state on reload
  useEffect(() => {
    const savedUser = localStorage.getItem('vendorbridge_user');
    if (savedUser) {
      setTimeout(() => {
        setUser(JSON.parse(savedUser));
      }, 0);
    }
  }, []);

  const login = (email, role) => {
    // Default mock user profile
    const profile = {
      email,
      role,
      name: role === 'vendor' ? 'Optima Power (Vendor)' : 
            role === 'manager' ? 'Marcus Vance (Manager)' :
            role === 'procurement_officer' ? 'Sarah Jenkins (Officer)' : 'System Administrator',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${role}`
    };
    setUser(profile);
    localStorage.setItem('vendorbridge_user', JSON.stringify(profile));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vendorbridge_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
