import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically inject the JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vendorbridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to catch central errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        localStorage.removeItem('vendorbridge_token');
        localStorage.removeItem('vendorbridge_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error.response.data || error);
    }
    return Promise.reject(error);
  }
);

export default api;
