import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const reportService = {
  getAll: () => api.get('/reports'),
  create: (data) => api.post('/reports', data),
  getStats: () => api.get('/analytics/stats'),
  updateStatus: (id, status) => api.patch(`/reports/${id}/status?status=${status}`),
  delete: (id) => api.delete(`/reports/${id}`),
};

export const volunteerService = {
  getAll: () => api.get('/volunteers'),
  create: (data) => api.post('/volunteers', data),
  assign: (reportId, volunteerId) => api.post(`/assign/${reportId}/${volunteerId}`),
};

export const bloodService = {
  getDonors: () => api.get('/blood/donors'),
  getInventory: () => api.get('/blood/inventory'),
  recordDonation: (donorId, units) => api.post(`/blood/donate/${donorId}?units=${units}`),
};

export const resourceService = {
  getAll: () => api.get('/resources'),
  create: (data) => api.post('/resources', data),
  restock: (id, qty) => api.patch(`/resources/${id}/restock?quantity=${qty}`),
  dispatch: (id, qty) => api.patch(`/resources/${id}/dispatch?quantity=${qty}`)
};

export const settingsService = {
  getSettings: () => api.get('/settings'),
  updateSetting: (key, value, category = "General") => api.post('/settings', { key, value, category }),
};

export default api;
