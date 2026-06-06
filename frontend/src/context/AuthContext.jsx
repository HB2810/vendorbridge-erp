/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync session with localStorage to persist login state on reload
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('vendorbridge_token');
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data);
          localStorage.setItem('vendorbridge_user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Session verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    verifySession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { access_token } = response.data;
      localStorage.setItem('vendorbridge_token', access_token);

      const meResponse = await api.get('/api/auth/me');
      const data = meResponse.data;
      setUser(data);
      localStorage.setItem('vendorbridge_user', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.detail || 'Authentication failed. Check your credentials.');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vendorbridge_user');
    localStorage.removeItem('vendorbridge_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
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
