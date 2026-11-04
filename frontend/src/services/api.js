import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getHealth: () => apiClient.get('/health'),
  getStats: () => apiClient.get('/dashboard/stats'),
  getTrends: () => apiClient.get('/dashboard/trends'),
  getUsers: () => apiClient.get('/users'),
  getUser: (id) => apiClient.get(/users/),
  registerUser: (data) => apiClient.post('/users/register', data),
  deleteUser: (id) => apiClient.delete(/users/),
  recognizeFrame: (frameBase64, threshold = null) =>
    apiClient.post('/recognition/frame', { frame: frameBase64, threshold }),
  getHistory: (limit = 50, offset = 0, status = null) =>
    apiClient.get('/recognition/history', { params: { limit, offset, status } }),
  clearHistory: () => apiClient.delete('/recognition/history'),
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data) => apiClient.put('/settings', data),
};

export default api;
