/**
 * AuthContext — manages user & admin authentication state.
 * Persists tokens in localStorage.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,      setUser]      = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [admin,     setAdmin]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin')); } catch { return null; }
  });
  const [loading,   setLoading]   = useState(false);

  // ── User login ──────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authService.login({ email, password });
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setUser(data.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── User register ───────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setLoading(true);
    try {
      const { data } = await authService.register(formData);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setUser(data.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── User logout ─────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // ── Admin login ─────────────────────────────────────────────
  const adminLogin = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authService.adminLogin({ email, password });
      localStorage.setItem('adminToken', data.data.token);
      localStorage.setItem('admin', JSON.stringify(data.data.admin));
      setAdmin(data.data.admin);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Admin login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Admin logout ─────────────────────────────────────────────
  const adminLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdmin(null);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin         = !!admin;

  return (
    <AuthContext.Provider value={{
      user, admin, loading,
      isAuthenticated, isAdmin,
      login, register, logout,
      adminLogin, adminLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
