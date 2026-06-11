import api from './api';
export const orderService = {
  placeOrder:  (data)   => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  trackOrder:  (id)     => api.get(`/orders/${id}/track`),
};
