import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Interceptor to add Token and handle Auth URL
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // If url starts with /auth, strip /api from baseURL by using a different instance or absolute URL?
    // Easier: keep base as localhost:8000 and specify full path for auth, 
    // OR just handle auth routes separately.

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Helper for Auth that bypasses the /api prefix if needed
const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';

export const PublicAPI = axios.create({
    baseURL: BASE_URL,
});

// Default instance tailored for /api
export default API;
