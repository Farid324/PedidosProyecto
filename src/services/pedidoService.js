// src/services/pedidoService.js
import api from './api';

const pedidoService = {
  getPedidos: async (params = {}) => {
    const response = await api.get('/pedidos', { params });
    return response.data;
  },

  getPedidoById: async (id) => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  },

  getPedidoByMesa: async (mesa) => {
    const response = await api.get(`/pedidos/mesa/${mesa}`);
    return response.data;
  },

  getMesasOcupadas: async () => {
    const response = await api.get('/pedidos/mesas-ocupadas');
    return response.data;
  },

  createPedido: async (data) => {
    const response = await api.post('/pedidos', data);
    return response.data;
  },

  updatePedido: async (id, data) => {
    const response = await api.put(`/pedidos/${id}`, data);
    return response.data;
  },

  updatePedidoItems: async (id, data) => {
    const response = await api.put(`/pedidos/${id}/items`, data);
    return response.data;
  },

  finalizarPedido: async (id, metodo_pago) => {
    const response = await api.put(`/pedidos/${id}/finalizar`, { metodo_pago });
    return response.data;
  },

  cancelPedido: async (id) => {
    const response = await api.delete(`/pedidos/${id}`);
    return response.data;
  }
};

export default pedidoService;
