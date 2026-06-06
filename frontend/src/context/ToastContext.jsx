import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info as InfoIcon } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-warning shrink-0" />;
      case 'info':
      default:
        return <InfoIcon className="w-5 h-5 text-indigo-brand shrink-0" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return 'border-emerald-500/30';
      case 'error': return 'border-rose-500/30';
      case 'warning': return 'border-amber-warning/30';
      case 'info':
      default: return 'border-indigo-brand/30';
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Toast container overlay */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full no-print">
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className={`flex items-start justify-between p-3.5 bg-[#121A30] border ${getBorderColor(type)} rounded-lg shadow-xl text-slate-100 font-sans animate-slide-in`}
            style={{
              animation: 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div className="flex gap-3 items-center">
              {getIcon(type)}
              <span className="text-sm font-medium">{message}</span>
            </div>
            <button 
              onClick={() => removeToast(id)} 
              className="text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Dynamic Keyframes injection */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(100%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
