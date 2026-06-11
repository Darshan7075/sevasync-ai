import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  getReports: () => api.get('/reports'),
  createReport: (reportData) => api.post('/reports', reportData),
  getStats: () => api.get('/analytics/stats'),
};

export const volunteerService = {
  getVolunteers: () => api.get('/volunteers'),
  assignVolunteer: (reportId, volunteerId) => api.post(`/assign/${reportId}/${volunteerId}`),
};

export default api;
