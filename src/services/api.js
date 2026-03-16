import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

console.log('API Base URL:', api.defaults.baseURL);

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log(`Making request to: ${config.url} (Authenticated: ${!!token})`);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
});

api.interceptors.response.use((response) => response, (error) => {
    console.error('Network/API Error Details:', {
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        status: error.response?.status,
        data: error.response?.data
    });

    if (error.config?.baseURL?.includes('your-render-url')) {
        alert('CRITICAL: You are still using the placeholder Render URL. Please update your .env file with your actual Render URL!');
    }

    return Promise.reject(error);
});

export default api;
