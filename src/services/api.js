import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 60000, // Increased to 60 seconds for Render cold starts
});

console.log('API Base URL:', api.defaults.baseURL);

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log(`Making request to: ${config.url} (Full URL: ${config.baseURL}${config.url})`);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
});

api.interceptors.response.use((response) => response, (error) => {
    const errorDetails = {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        status: error.response?.status,
        data: error.response?.data
    };
    console.error('Network/API Error Details:', errorDetails);

    if (error.config?.baseURL?.includes('your-render-url') || error.config?.baseURL === '/api') {
        alert(`CONFIG ERROR: App using invalid URL: ${error.config?.baseURL}. Check .env.`);
    } else if (error.message === 'Network Error') {
        alert(`NETWORK ERROR: Cannot reach ${error.config?.baseURL || 'server'}. Is internet on? Is the API URL https? Details: ${error.code || 'None'}`);
    } else if (error.code === 'ECONNABORTED') {
        alert('TIMEOUT ERROR: The server took too long to respond. This is common if Render is waking up. Please try again in 30 seconds.');
    }

    return Promise.reject(error);
});

export default api;
