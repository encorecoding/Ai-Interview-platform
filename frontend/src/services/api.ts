import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Firebase ID token or Demo token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  } else if (typeof window !== 'undefined' && localStorage.getItem('prepai_demo_active') === 'true') {
    config.headers.Authorization = 'Bearer demo-bearer-token';
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && localStorage.getItem('prepai_demo_active') === 'true') {
        // Backend returned 401, don't kick user out of demo session
        console.warn('API returned 401 in demo mode — continuing with local fallback');
      } else {
        auth.signOut();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
