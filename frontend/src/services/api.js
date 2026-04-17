import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3002',
  timeout: 10000,
});

export const fetchStores = () => api.get('/api/stores');
export const fetchStore = (id) => api.get(`/api/stores/${id}`);
export const fetchStoreInventory = (id) => api.get(`/api/stores/${id}/inventory`);
export const fetchLiveOrders = () => api.get('/api/orders/live');
export const fetchSurgeStats = () => api.get('/api/stats/surge');
export const fetchAlerts = () => api.get('/api/alerts');

export default api;