// server/controllers/pedidoController.js
const { Pedido, DetallePedido, Producto } = require('../models');
const { sequelize } = require('../config/database');

// Obtener pedidos
const getPedidos = async (req, res) => {
  try {
    const { estado, fecha, cajero } = req.query;
    const where = {};

    // Filtros opcionales
    if (estado) where.estado = estado;
    if (cajero) where.cajero_nombre = cajero;
    
    if (fecha) {
      const fechaInicio = new Date(fecha);
      const fechaFin = new Date(fecha);
      fechaFin.setDate(fechaFin.getDate() + 1);
      
      where.fecha_pedido = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    }

    // Si es cajero, solo ver sus pedidos
    if (req.user.rol === 'cajero') {
      where.cajero_nombre = req.user.nombre;
    }

    const pedidos = await Pedido.findAll({
      where,
      include: [{
        model: DetallePedido,
        include: [{ model: Producto }]
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: pedidos
    });
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo pedidos'
    });
  }
};

// Obtener pedido por ID
const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await Pedido.findByPk(id, {
      include: [{
        model: DetallePedido,
        include: [{ model: Producto }]
      }]
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo pedido'
    });
  }
};

// Crear pedido
const createPedido = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { mesa, items, observaciones } = req.body;
    const { nombre, turno } = req.user;

    // Crear pedido principal
    const pedido = await Pedido.create({
      mesa,
      cajero_nombre: nombre,
      turno: turno || 'AM',
      observaciones,
      estado: 'pendiente'
    }, { transaction: t });

    let subtotal = 0;

    // Crear detalles del pedido
    for (const item of items) {
      const producto = await Producto.findByPk(item.producto_id, { transaction: t });
      
      if (!producto) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          error: `Producto con ID ${item.producto_id} no encontrado`
        });
      }

      const itemSubtotal = producto.precio * item.cantidad;
      subtotal += itemSubtotal;

      await DetallePedido.create({
        pedido_id: pedido.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: producto.precio,
        subtotal: itemSubtotal,
        observaciones: item.observaciones
      }, { transaction: t });
    }

    // Actualizar totales del pedido
    await pedido.update({
      subtotal,
      total: subtotal
    }, { transaction: t });

    await t.commit();

    // Obtener pedido completo con detalles
    const pedidoCompleto = await Pedido.findByPk(pedido.id, {
      include: [{
        model: DetallePedido,
        include: [{ model: Producto }]
      }]
    });

    res.status(201).json({
      success: true,
      data: pedidoCompleto
    });
  } catch (error) {
    await t.rollback();
    console.error('Error creando pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando pedido'
    });
  }
};

// Actualizar pedido
const updatePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { mesa, observaciones } = req.body;

    const pedido = await Pedido.findByPk(id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    await pedido.update({
      mesa,
      observaciones
    });

    res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    console.error('Error actualizando pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando pedido'
    });
  }
};

// Actualizar estado del pedido
const updateEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const pedido = await Pedido.findByPk(id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    await pedido.update({ estado });

    res.json({
      success: true,
      data: pedido,
      message: `Pedido actualizado a ${estado}`
    });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando estado del pedido'
    });
  }
};

// Cancelar pedido
const cancelPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await Pedido.findByPk(id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    await pedido.update({ estado: 'cancelado' });

    res.json({
      success: true,
      message: 'Pedido cancelado correctamente'
    });
  } catch (error) {
    console.error('Error cancelando pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error cancelando pedido'
    });
  }
};

module.exports = {
  getPedidos,
  getPedidoById,
  createPedido,
  updatePedido,
  updateEstadoPedido,
  cancelPedido
};