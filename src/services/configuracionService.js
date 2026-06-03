// src/services/configuracionService.js
import api from './api';

const configuracionService = {
  getQR: async () => {
    const response = await api.get('/config/qr_pago');
    return response.data;
  },
  saveQR: async (base64) => {
    const response = await api.put('/config/qr_pago', { valor: base64 });
    return response.data;
  },
  getConfig: async (clave) => {
    const response = await api.get(`/config/${clave}`);
    return response.data;
  },
  saveConfig: async (clave, valor) => {
    const response = await api.put(`/config/${clave}`, { valor });
    return response.data;
  }
};

export default configuracionService;
