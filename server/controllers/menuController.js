const { Categoria, Producto } = require('../models');
const { Op } = require('sequelize');

/** --------- CATEGORÍAS --------- **/
exports.getCategorias = async (req, res) => {
  try {
    const rows = await Categoria.findAll({ order: [['nombre', 'ASC']] });
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error('getCategorias', e);
    res.status(500).json({ success: false, error: 'Error listando categorías' });
  }
};

exports.createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, activo = true } = req.body || {};
    if (!nombre?.trim()) return res.status(400).json({ success: false, error: 'Nombre es requerido' });

    const exists = await Categoria.findOne({ where: { nombre: nombre.trim() } });
    if (exists) return res.status(409).json({ success: false, error: 'La categoría ya existe' });

    const row = await Categoria.create({ nombre: nombre.trim(), descripcion: descripcion || null, activo });
    res.status(201).json({ success: true, data: row });
  } catch (e) {
    console.error('createCategoria', e);
    res.status(500).json({ success: false, error: 'Error creando categoría' });
  }
};

exports.updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body || {};
    const row = await Categoria.findByPk(id);
    if (!row) return res.status(404).json({ success: false, error: 'Categoría no encontrada' });

    if (nombre) row.nombre = nombre.trim();
    if (descripcion !== undefined) row.descripcion = descripcion;
    if (activo !== undefined) row.activo = !!activo;

    await row.save();
    res.json({ success: true, data: row });
  } catch (e) {
    console.error('updateCategoria', e);
    res.status(500).json({ success: false, error: 'Error actualizando categoría' });
  }
};

exports.deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await Categoria.findByPk(id);
    if (!row) return res.status(404).json({ success: false, error: 'Categoría no encontrada' });

    const usados = await Producto.count({ where: { categoria_id: id } });
    if (usados > 0) {
      return res.status(409).json({
        success: false,
        error: 'No se puede eliminar: hay productos asociados. Desactívala o mueve los productos primero.',
      });
    }

    await row.destroy();
    res.json({ success: true });
  } catch (e) {
    console.error('deleteCategoria', e);
    res.status(500).json({ success: false, error: 'Error eliminando categoría' });
  }
};

/** --------- PRODUCTOS --------- **/
exports.getProductos = async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    const where = q
      ? { [Op.or]: [{ nombre: { [Op.like]: `%${q}%` } }, { descripcion: { [Op.like]: `%${q}%` } }] }
      : {};

    const rows = await Producto.findAll({
      where,
      include: [{ model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] }],
      order: [['nombre', 'ASC']],
    });

    res.json({
      success: true,
      data: rows.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: Number(p.precio),
        disponible: !!p.disponible,
        categoria_id: p.categoria_id,
        categoria: p.categoria ? { id: p.categoria.id, nombre: p.categoria.nombre } : null,
        imagen_url: p.imagen_url || null,
        imagen_base64: p.imagen_base64 || null, // ✅ AGREGADO: Para enviar la imagen al frontend
      })),
    });
  } catch (e) {
    console.error('getProductos', e);
    res.status(500).json({ success: false, error: 'Error listando productos' });
  }
};

exports.createProducto = async (req, res) => {
  try {
    // ✅ AGREGADO: extraer imagen_base64
    const { nombre, descripcion, precio, categoria_id, disponible = true, imagen_url, imagen_base64 } = req.body || {};
    
    if (!nombre?.trim()) return res.status(400).json({ success: false, error: 'Nombre es requerido' });
    if (!categoria_id) return res.status(400).json({ success: false, error: 'Categoría es requerida' });
    
    const cat = await Categoria.findByPk(categoria_id);
    if (!cat) return res.status(404).json({ success: false, error: 'Categoría no existe' });

    const row = await Producto.create({
      nombre: nombre.trim(),
      descripcion: descripcion || null,
      precio: Number(precio || 0),
      categoria_id,
      disponible: !!disponible,
      imagen_url: imagen_url || null,
      imagen_base64: imagen_base64 || null, // ✅ AGREGADO: Guardar la imagen
    });

    res.status(201).json({ success: true, data: row });
  } catch (e) {
    console.error('createProducto', e);
    res.status(500).json({ success: false, error: 'Error creando producto' });
  }
};

exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    // ✅ AGREGADO: extraer imagen_base64
    const { nombre, descripcion, precio, categoria_id, disponible, imagen_url, imagen_base64 } = req.body || {};
    
    const row = await Producto.findByPk(id);
    if (!row) return res.status(404).json({ success: false, error: 'Producto no encontrado' });

    if (categoria_id) {
      const cat = await Categoria.findByPk(categoria_id);
      if (!cat) return res.status(404).json({ success: false, error: 'Categoría no existe' });
      row.categoria_id = categoria_id;
    }
    if (nombre) row.nombre = nombre.trim();
    if (descripcion !== undefined) row.descripcion = descripcion;
    if (precio !== undefined) row.precio = Number(precio);
    if (disponible !== undefined) row.disponible = !!disponible;
    if (imagen_url !== undefined) row.imagen_url = imagen_url;
    
    // ✅ AGREGADO: Actualizar imagen si viene en la petición
    if (imagen_base64 !== undefined) row.imagen_base64 = imagen_base64;

    await row.save();
    res.json({ success: true, data: row });
  } catch (e) {
    console.error('updateProducto', e);
    res.status(500).json({ success: false, error: 'Error actualizando producto' });
  }
};

exports.deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await Producto.findByPk(id);
    if (!row) return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    await row.destroy();
    res.json({ success: true });
  } catch (e) {
    console.error('deleteProducto', e);
    res.status(500).json({ success: false, error: 'Error eliminando producto' });
  }
};

exports.setDisponibilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { disponible } = req.body || {};
    const row = await Producto.findByPk(id);
    if (!row) return res.status(404).json({ success: false, error: 'Producto no encontrado' });

    row.disponible = !!disponible;
    await row.save();
    res.json({ success: true, data: row });
  } catch (e) {
    console.error('setDisponibilidad', e);
    res.status(500).json({ success: false, error: 'Error actualizando estado' });
  }
};