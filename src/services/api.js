// src/services/api.js
import axios from 'axios';
console.log("URL QUE ESTOY USANDO:", import.meta.env.VITE_API_URL || 'http://localhost:3001/api');
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

// 👉 Adjunta el token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 👉 Manejo global de 401 (opcional pero útil)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Limpia sesión y manda a login
      localStorage.removeItem('token');
      // evita bucles si ya estás en /login
      if (!location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
