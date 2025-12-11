import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('=== AXIOS REQUEST ===');
  console.log('URL:', request.url);
  console.log('Method:', request.method);
  console.log('Data:', request.data);
  console.log('Data stringified:', JSON.stringify(request.data));
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('=== AXIOS RESPONSE SUCCESS ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    return response;
  },
  error => {
    console.log('=== AXIOS RESPONSE ERROR ===');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Full error:', error);
    return Promise.reject(error);
  }
);

// Participants API
export const participantsApi = {
  getAll: () => api.get('/participants/get'),
  getById: (id) => api.get(`/participants/get/${id}`),
  create: (data) => api.post('/participants/create', data),
  update: (id, data) => api.put(`/participants/update/${id}`, data),
};

// Events API
export const eventsApi = {
  getAll: () => api.get('/events/get'),
  getById: (id) => api.get(`/events/get/${id}`),
  create: (data) => api.post('/events/create', data),
  getEventTypes: () => api.get('/events/list_event_type'),
};

// Activity API
export const activityApi = {
  getMetrics: (eventId, participantId) => 
    api.post(`/activity/get_metrics/event_id/${eventId}?participant_id=${participantId}`),
  add: (data) => api.post('/activity/add_activity/', data),
};

export default api;

