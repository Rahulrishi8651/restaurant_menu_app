import api from './api';
export const menuService = {
  getItems:     (params)    => api.get('/menu', { params }),
  getCategories:()          => api.get('/menu/categories'),
  getItemById:  (id)        => api.get(`/menu/${id}`),
  createItem:   (data)      => api.post('/menu', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateItem:   (id, data)  => api.put(`/menu/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteItem:   (id)        => api.delete(`/menu/${id}`),
};
