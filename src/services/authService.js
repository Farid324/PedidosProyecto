// src/services/authService.js
import api from './api';

const authService = {
  async loginAdmin(email, password) {
    // ✅ ruta correcta
    const response = await api.post('/auth/login/admin', { email, password });
    if (response.data.token) localStorage.setItem('token', response.data.token);
    return response.data;
  },

  async loginCajero(nombre, turno) {
    // ✅ ruta correcta
    const response = await api.post('/auth/login/cajero', { nombre, turno });
    if (response.data.token) localStorage.setItem('token', response.data.token);
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },
};

export default authService;