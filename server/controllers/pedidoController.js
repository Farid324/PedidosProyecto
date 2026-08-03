// server/controllers/pedidoController.js
const { Pedido, DetallePedido, Producto, Factura } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Obtener pedidos
const getPedidos = async (req, res) => {
  try {
    const { estado, fecha, cajero } = req.query;
    const where = {};

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

    if (req.user.rol === 'cajero') {
      where.cajero_nombre = req.user.nombre;
      if (req.user.turno) {
        where.turno = req.user.turno;
      }
    }

    const pedidos = await Pedido.findAll({
      where,
      include: [{
        model: DetallePedido,
        include: [{ model: Producto }]
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: pedidos });
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo pedidos' });
  }
};

// Obtener pedido por ID
const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await Pedido.findByPk(id, {
      include: [{ model: DetallePedido, include: [{ model: Producto }] }]
    });

    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    res.json({ success: true, data: pedido });
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo pedido' });
  }
};

// Obtener pedido activo por mesa
const getPedidoByMesa = async (req, res) => {
  try {
    const { mesa } = req.params;

    const whereClause = {
      mesa: parseInt(mesa),
      estado: { [Op.in]: ['pendiente', 'en_proceso'] }
    };

    if (req.user && req.user.rol === 'cajero' && req.user.turno) {
      whereClause.turno = req.user.turno;
      whereClause.cajero_nombre = req.user.nombre;
    }

    const pedido = await Pedido.findOne({
      where: whereClause,
      include: [{ model: DetallePedido, include: [{ model: Producto }] }],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: pedido });
  } catch (error) {
    console.error('Error obteniendo pedido por mesa:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo pedido por mesa' });
  }
};

// Obtener mesas ocupadas
const getMesasOcupadas = async (req, res) => {
  try {
    const whereClause = { estado: { [Op.in]: ['pendiente', 'en_proceso'] } };
    
    if (req.user && req.user.rol === 'cajero' && req.user.turno) {
      whereClause.turno = req.user.turno;
      whereClause.cajero_nombre = req.user.nombre;
    }

    const pedidosActivos = await Pedido.findAll({
      where: whereClause,
      attributes: ['mesa', 'created_at']
    });

    const now = new Date();
    const mesas = pedidosActivos.map(p => {
      const createdAt = new Date(p.dataValues.created_at || p.created_at);
      const diffMs = now - createdAt;
      const diffMins = Math.floor(diffMs / 60000);
      
      return {
        id: p.mesa,
        estado: diffMins >= 20 ? 'pendiente' : 'ocupada'
      };
    });

    res.json({ success: true, data: mesas });
  } catch (error) {
    console.error('Error obteniendo mesas ocupadas:', error);
    res.status(500).json({ success: false, error: 'Error obteniendo mesas ocupadas' });
  }
};

// Crear pedido
const createPedido = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { mesa, items, observaciones, razon_social, nit, tipo_pedido } = req.body;
    const { nombre, turno } = req.user;

    if (!razon_social) {
      await t.rollback();
      return res.status(400).json({ success: false, error: 'La razón social es obligatoria' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const maxNumeroDiario = await Pedido.max('numero_diario', {
      where: {
        fecha_pedido: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      transaction: t
    });

    const numero_diario = (maxNumeroDiario || 0) + 1;

    const pedido = await Pedido.create({
      numero_diario,
      mesa,
      cajero_nombre: nombre,
      turno: turno || 'AM',
      razon_social,
      nit: nit || null,
      tipo_pedido: tipo_pedido || 'mesa',
      observaciones,
      estado: 'pendiente'
    }, { transaction: t });

    let subtotal = 0;

    for (const item of items) {
      const producto = await Producto.findByPk(item.producto_id, { transaction: t });
      
      if (!producto) {
        await t.rollback();
        return res.status(400).json({ success: false, error: `Producto con ID ${item.producto_id} no encontrado` });
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

    await pedido.update({ subtotal, total: subtotal }, { transaction: t });
    await t.commit();

    const pedidoCompleto = await Pedido.findByPk(pedido.id, {
      include: [{ model: DetallePedido, include: [{ model: Producto }] }]
    });

    res.status(201).json({ success: true, data: pedidoCompleto });
  } catch (error) {
    await t.rollback();
    console.error('Error creando pedido:', error);
    res.status(500).json({ success: false, error: 'Error creando pedido' });
  }
};

// Actualizar items de un pedido existente
const updatePedidoItems = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { items, observaciones, razon_social, nit, tipo_pedido } = req.body;

    const pedido = await Pedido.findByPk(id, { transaction: t });

    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    // Borrar detalles anteriores
    await DetallePedido.destroy({ where: { pedido_id: id }, transaction: t });

    let subtotal = 0;

    for (const item of items) {
      const producto = await Producto.findByPk(item.producto_id, { transaction: t });
      
      if (!producto) {
        await t.rollback();
        return res.status(400).json({ success: false, error: `Producto con ID ${item.producto_id} no encontrado` });
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

    // Actualizar pedido
    await pedido.update({
      subtotal,
      total: subtotal,
      observaciones: observaciones !== undefined ? observaciones : pedido.observaciones,
      razon_social: razon_social || pedido.razon_social,
      nit: nit !== undefined ? nit : pedido.nit,
      tipo_pedido: tipo_pedido || pedido.tipo_pedido,
    }, { transaction: t });

    await t.commit();

    const pedidoCompleto = await Pedido.findByPk(pedido.id, {
      include: [{ model: DetallePedido, include: [{ model: Producto }] }]
    });

    res.json({ success: true, data: pedidoCompleto });
  } catch (error) {
    await t.rollback();
    console.error('Error actualizando items del pedido:', error);
    res.status(500).json({ success: false, error: 'Error actualizando items del pedido' });
  }
};

// Finalizar pedido (liberar mesa)
const finalizarPedido = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { metodo_pago } = req.body;

    const pedido = await Pedido.findByPk(id, { transaction: t });

    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    await pedido.update({
      estado: 'completado',
      metodo_pago: metodo_pago || pedido.metodo_pago,
    }, { transaction: t });

    // Generar Factura automáticamente al finalizar el pedido
    const fecha = new Date();
    const count = await Factura.count({ transaction: t });
    const numero_factura = `FAC-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${(count + 1).toString().padStart(5, '0')}`;

    const subtotal = pedido.subtotal || 0;
    const total = pedido.total || 0;

    await Factura.create({
      numero_factura,
      pedido_id: pedido.id,
      cliente_nombre: pedido.razon_social || 'S/N',
      cliente_nit: pedido.nit || '0',
      cajero_nombre: pedido.cajero_nombre || 'cajero',
      subtotal,
      descuento: 0,
      total,
      metodo_pago: metodo_pago || pedido.metodo_pago,
      estado: 'pagada'
    }, { transaction: t });

    await t.commit();
    res.json({ success: true, data: pedido, message: 'Pedido finalizado y facturado correctamente' });
  } catch (error) {
    await t.rollback();
    console.error('Error finalizando pedido:', error);
    res.status(500).json({ success: false, error: 'Error finalizando pedido' });
  }
};

// Actualizar pedido
const updatePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { mesa, observaciones, metodo_pago, pago_qr } = req.body;

    const pedido = await Pedido.findByPk(id);

    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    await pedido.update({
      mesa: mesa !== undefined ? mesa : pedido.mesa,
      observaciones: observaciones !== undefined ? observaciones : pedido.observaciones,
      metodo_pago: metodo_pago !== undefined ? metodo_pago : pedido.metodo_pago,
      pago_qr: pago_qr !== undefined ? pago_qr : pedido.pago_qr,
    });

    res.json({ success: true, data: pedido });
  } catch (error) {
    console.error('Error actualizando pedido:', error);
    res.status(500).json({ success: false, error: 'Error actualizando pedido' });
  }
};

// Actualizar estado del pedido
const updateEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const pedido = await Pedido.findByPk(id);

    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    await pedido.update({ estado });
    res.json({ success: true, data: pedido, message: `Pedido actualizado a ${estado}` });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ success: false, error: 'Error actualizando estado del pedido' });
  }
};

// Cancelar pedido
const cancelPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await Pedido.findByPk(id);

    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    await pedido.update({ estado: 'cancelado' });
    res.json({ success: true, message: 'Pedido cancelado correctamente' });
  } catch (error) {
    console.error('Error cancelando pedido:', error);
    res.status(500).json({ success: false, error: 'Error cancelando pedido' });
  }
};

module.exports = {
  getPedidos,
  getPedidoById,
  getPedidoByMesa,
  getMesasOcupadas,
  createPedido,
  updatePedido,
  updatePedidoItems,
  updateEstadoPedido,
  finalizarPedido,
  cancelPedido
};