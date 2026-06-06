/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync session with localStorage to persist login state on reload
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('vendorbridge_token');
      const savedUser = localStorage.getItem('vendorbridge_user');
      if (token) {
        try {
          const response = await fetch('http://127.0.0.1:8000/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            localStorage.setItem('vendorbridge_user', JSON.stringify(data));
          } else {
            logout();
          }
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
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Authentication failed. Check your credentials.');
      }

      const { access_token } = await response.json();
      localStorage.setItem('vendorbridge_token', access_token);

      const meResponse = await fetch('http://127.0.0.1:8000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      if (!meResponse.ok) {
        throw new Error('Failed to retrieve user profile.');
      }

      const data = await meResponse.json();
      setUser(data);
      localStorage.setItem('vendorbridge_user', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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
