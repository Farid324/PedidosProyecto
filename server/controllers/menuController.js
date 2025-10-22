// server/controllers/menuController.js
const { Categoria, Producto } = require('../models');

// Obtener todas las categorías
const getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: { activo: true },
      include: [{
        model: Producto,
        where: { disponible: true },
        required: false
      }]
    });

    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo categorías'
    });
  }
};

// Crear categoría
const createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    const categoria = await Categoria.create({
      nombre,
      descripcion
    });

    res.status(201).json({
      success: true,
      data: categoria
    });
  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando categoría'
    });
  }
};

// Obtener todos los productos
const getProductos = async (req, res) => {
  try {
    const { categoria } = req.query;
    const where = { disponible: true };
    
    if (categoria) {
      where.categoria_id = categoria;
    }

    const productos = await Producto.findAll({
      where,
      include: [{ model: Categoria }]
    });

    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo productos'
    });
  }
};

// Obtener producto por ID
const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const producto = await Producto.findByPk(id, {
      include: [{ model: Categoria }]
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo producto'
    });
  }
};

// Crear producto
const createProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria_id, imagen_url } = req.body;

    const producto = await Producto.create({
      nombre,
      descripcion,
      precio,
      categoria_id,
      imagen_url
    });

    res.status(201).json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando producto'
    });
  }
};

// Actualizar producto
const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria_id, disponible, imagen_url } = req.body;

    const producto = await Producto.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    await producto.update({
      nombre,
      descripcion,
      precio,
      categoria_id,
      disponible,
      imagen_url
    });

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando producto'
    });
  }
};

// Eliminar producto (soft delete)
const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    await producto.update({ disponible: false });

    res.json({
      success: true,
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando producto'
    });
  }
};

module.exports = {
  getCategorias,
  createCategoria,
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
};