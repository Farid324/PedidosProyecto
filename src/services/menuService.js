// src/services/menuService.js
import api from './api';

const menuService = {
  // Categorías
  getCategorias: () => api.get('/menu/categorias').then(r => r.data),
  createCategoria: (payload) => api.post('/menu/categorias', payload).then(r => r.data),
  updateCategoria: (id, payload) => api.put(`/menu/categorias/${id}`, payload).then(r => r.data),
  deleteCategoria: (id) => api.delete(`/menu/categorias/${id}`).then(r => r.data),

  // Productos
  getProductos: (q = '') => api.get('/menu/productos', { params: { q } }).then(r => r.data),
  createProducto: (payload) => api.post('/menu/productos', payload).then(r => r.data),
  updateProducto: (id, payload) => api.put(`/menu/productos/${id}`, payload).then(r => r.data),
  deleteProducto: (id) => api.delete(`/menu/productos/${id}`).then(r => r.data),
  setDisponibilidad: (id, disponible) => api.put(`/menu/productos/${id}/disponible`, { disponible }).then(r => r.data),
};

export default menuService;
