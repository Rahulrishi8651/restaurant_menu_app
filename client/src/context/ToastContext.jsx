/**
 * ToastContext — lightweight toast notification system.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);
let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px',
        maxWidth: '360px',
      }}>
        {toasts.map(t => (
          <div key={t.id} onClick={() => removeToast(t.id)} style={{
            padding: '14px 18px',
            background: t.type === 'success' ? '#1B4332' :
                        t.type === 'error'   ? '#4A0C0C' :
                        t.type === 'warning' ? '#4A2C04' : '#0D1B2A',
            border: `1px solid ${
              t.type === 'success' ? '#4CAF50' :
              t.type === 'error'   ? '#F44336' :
              t.type === 'warning' ? '#FF9800' : '#2196F3'
            }`,
            color: '#fff',
            borderRadius: '12px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,.5)',
            animation: 'slideInRight 0.3s ease',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span>{
              t.type === 'success' ? '✓' :
              t.type === 'error'   ? '✕' :
              t.type === 'warning' ? '⚠' : 'ℹ'
            }</span>
            {t.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
