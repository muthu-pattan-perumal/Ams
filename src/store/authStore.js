import { create } from 'zustand';
import api from '../services/api';

const tryParse = (key) => {
    try {
        const item = localStorage.getItem(key);
        if (!item || item === 'undefined') return null;
        return JSON.parse(item);
    } catch (e) {
        console.error(`Error parsing ${key} from storage:`, e);
        return null;
    }
};

const useAuthStore = create((set) => ({
    user: tryParse('user'),
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    login: async (email, password) => {
        console.log('Attempting login for:', email);
        set({ loading: true, error: null });
        try {
            const res = await api.post('/login', { email, password });
            const { token, user } = res.data;
            
            if (!token || !user) {
                console.error('Server response was OK but missing expected data:', res.data);
                throw new Error('API Error: Server returned an empty response. Please check if VITE_API_URL is correct.');
            }

            console.log('Login successful, storing user data...');
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, token, isAuthenticated: true, loading: false });
        } catch (err) {
            console.error('Login error details:', err);
            set({ error: err.response?.data?.message || err.message || 'Login failed', loading: false });
            throw err;
        }
    },

    logout: () => {
        console.log('Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found in storage, skipping checkAuth');
            return;
        }
        
        console.log('Checking auth status with server...');
        try {
            const res = await api.get('/me');
            if (res.data?.user) {
                console.log('Auth check successful');
                set({ user: res.data.user, isAuthenticated: true });
            } else {
                console.error('Auth check returned invalid data:', res.data);
                throw new Error('Missing user data in session validation');
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            // Only logout if it's a 401/403 (expired token)
            // If it's a network error (500/404), maybe keep the data and retry? 
            // For now, keep existing behavior but log it.
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, token: null, isAuthenticated: false });
        }
    },
}));

export default useAuthStore;
