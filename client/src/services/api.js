/**
 * Axios instance with JWT interceptors.
 * All API calls go through this instance.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ──────────────────────────
api.interceptors.request.use(
  (config) => {
    // Check admin token first, then user token
    const adminToken = localStorage.getItem('adminToken');
    const userToken  = localStorage.getItem('token');
    const token = adminToken || userToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
