import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 15000, // 15 seconds timeout for mobile networks/cold starts
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
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        status: error.response?.status,
        data: error.response?.data
    });

    if (error.config?.baseURL?.includes('your-render-url') || error.config?.baseURL === '/api') {
        alert('CRITICAL: Your app is not configured with a valid Render URL. Please check your .env file and rebuild the APK.');
    } else if (error.message === 'Network Error') {
        alert('NETWORK ERROR: The app cannot reach the server. Please check your internet connection or if the Render server is live.');
    }

    return Promise.reject(error);
});

export default api;
