import api from './api';
export const adminService = {
  getDashboard:      ()          => api.get('/admin/dashboard'),
  getAnalytics:      (period)    => api.get('/admin/analytics', { params: { period } }),
  getOrders:         (params)    => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data)  => api.put(`/admin/orders/${id}/status`, data),
  getUsers:          (params)    => api.get('/admin/users', { params }),
};
