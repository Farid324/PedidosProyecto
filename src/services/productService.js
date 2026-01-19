// src/services/productService.js
import api from './api';

const productService = {
  // Obtener todos los productos
  getAll: async () => {
    try {
      const response = await api.get('/menu/productos');
      // Si el backend devuelve { success: true, data: [...] }, retornamos eso.
      // Si devuelve directo el array, retornamos eso.
      return response.data;
    } catch (e) {
      console.error("Error fetching products", e);
      return []; // Retorna array vacío en error para evitar pantallas blancas
    }
  },

  // Obtener todas las categorías
  getCategories: async () => {
    try {
      const response = await api.get('/menu/categorias');
      return response.data;
    } catch (e) {
      console.error("Error fetching categories", e);
      return [];
    }
  },

  // Crear producto
  create: async (data) => {
    const response = await api.post('/menu/productos', data);
    return response.data;
  },

  // Actualizar producto
  update: async (id, data) => {
    const response = await api.put(`/menu/productos/${id}`, data);
    return response.data;
  },

  // Eliminar producto
  delete: async (id) => {
    const response = await api.delete(`/menu/productos/${id}`);
    return response.data;
  },
  
  // Cambiar disponibilidad
  toggleStatus: async (id, disponible) => {
    const response = await api.patch(`/menu/productos/${id}/status`, { disponible });
    return response.data;
  }
};

export default productService;