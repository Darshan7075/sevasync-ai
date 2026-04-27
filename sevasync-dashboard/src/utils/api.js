import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
