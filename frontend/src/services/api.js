import axios from 'axios';
import API_URL from '../config';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('phish_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling global errors (like 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('phish_token');
            window.location.reload(); // Force re-login
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (params) => api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.post('/auth/profile/update', data),
    connectEmail: (credentials) => api.post('/auth/connect-email-credentials', credentials),
};

export const scanAPI = {
    getHistory: () => api.get('/scans/history'),
    predict: (data) => api.post('/predict', data),
    explain: (data) => api.post('/explain', data),
    save: (data) => api.post('/scans/save', data),
    chat: (data) => api.post('/chat', data),
    fetchEmails: (limit = 15) => api.get(`/api/email/fetch?limit=${limit}`),
    getStats: () => api.get('/stats'),
    getIntel: () => api.get('/api/threats/intel'),
};

export default api;
