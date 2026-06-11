import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const detail = data?.detail || 'An unexpected error occurred';
      console.error(`[API Error] ${status}: ${detail}`, {
        url: error.config?.url,
        method: error.config?.method,
      });
    } else if (error.request) {
      console.error('[API Error] No response received - server may be unavailable', {
        url: error.config?.url,
      });
    } else {
      console.error('[API Error] Request setup failed:', error.message);
    }
    return Promise.reject(error);
  }
);

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
  updateProfile: (id, data) => api.put(`/volunteers/${id}`, data),
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

export const chatService = {
  sendMessage: (message) => api.post('/chat', { message }),
};

export default api;
