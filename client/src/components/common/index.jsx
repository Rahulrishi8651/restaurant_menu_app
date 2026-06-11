// ── ProtectedRoute.jsx ─────────────────────────────────────────
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
};

// ── LoadingSpinner.jsx ─────────────────────────────────────────

export const LoadingSpinner = ({ size = 40, color = 'var(--clr-primary)' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px',
  }}>
    <div style={{
      width: size, height: size,
      border: `3px solid rgba(255,255,255,0.1)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const PageLoader = () => (
  <div style={{
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'var(--clr-bg)',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>🍽️</div>
      <LoadingSpinner size={48} />
    </div>
  </div>
);
