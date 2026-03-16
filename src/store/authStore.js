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
                throw new Error('Invalid server response: Missing token or user data');
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
                throw new Error('No user data in /me response');
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, token: null, isAuthenticated: false });
        }
    },
}));

export default useAuthStore;
