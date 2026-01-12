import axios from 'axios';

// 1. Get the raw URL from env
const ENV_URL = import.meta.env.VITE_API_URL;

// 2. Logic to ensure it ends with /api
let API_BASE = 'http://localhost:8000/api'; // Default

if (ENV_URL) {
    // Remove trailing slash if present to normalize
    const normalized = ENV_URL.replace(/\/$/, '');
    // Keep or add /api
    API_BASE = normalized.endsWith('/api') ? normalized : `${normalized}/api`;
}

const API = axios.create({
    baseURL: API_BASE,
});

// Interceptor to add Token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 3. For public/auth routes (which are at /auth, not /api/auth)
// We need the root URL. Since API_BASE is guaranteed to end with /api now, we strip it.
const ROOT_URL = API_BASE.replace(/\/api$/, '');

export const PublicAPI = axios.create({
    baseURL: ROOT_URL,
});

export default API;
