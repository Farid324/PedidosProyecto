import axios from 'axios';
import useAuthStore from '../store/authStore';

console.log('URL QUE ESTOY USANDO:', import.meta.env.VITE_API_URL || 'http://localhost:3001/api');
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \Bearer \\;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      const isLoginRoute = err.config.url && err.config.url.includes('/auth/login');
      if (!isLoginRoute) {
        localStorage.removeItem('token');
        useAuthStore.getState().logout();
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
