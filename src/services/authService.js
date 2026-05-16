// src/services/authService.js
import api from './api';

const authService = {
  async loginAdmin(email, password) {
    const response = await api.post('/auth/login/admin', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Envía nombre + password + turno
  async loginCajero(nombre, password, turno) {
    const response = await api.post('/auth/login/cajero', { nombre, password, turno });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

export default authService;