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
  }
};

export default configuracionService;
