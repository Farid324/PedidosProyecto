// server/controllers/facturaController.js
const { Factura, Pedido, DetallePedido, Producto } = require('../models');
const { sequelize } = require('../config/database');

// Obtener facturas
const getFacturas = async (req, res) => {
  try {
    const { estado, fecha } = req.query;
    const where = {};

    if (estado) where.estado = estado;
    
    if (fecha) {
      const fechaInicio = new Date(fecha);
      const fechaFin = new Date(fecha);
      fechaFin.setDate(fechaFin.getDate() + 1);
      
      where.fecha_emision = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    }

    // Si es cajero, solo ver sus facturas
    if (req.user.rol === 'cajero') {
      where.cajero_nombre = req.user.nombre;
    }

    const facturas = await Factura.findAll({
      where,
      include: [{
        model: Pedido,
        include: [{
          model: DetallePedido,
          include: [{ model: Producto }]
        }]
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: facturas
    });
  } catch (error) {
    console.error('Error obteniendo facturas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo facturas'
    });
  }
};

// Obtener factura por ID
const getFacturaById = async (req, res) => {
  try {
    const { id } = req.params;

    const factura = await Factura.findByPk(id, {
      include: [{
        model: Pedido,
        include: [{
          model: DetallePedido,
          include: [{ model: Producto }]
        }]
      }]
    });

    if (!factura) {
      return res.status(404).json({
        success: false,
        error: 'Factura no encontrada'
      });
    }

    res.json({
      success: true,
      data: factura
    });
  } catch (error) {
    console.error('Error obteniendo factura:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo factura'
    });
  }
};

// Crear factura
const createFactura = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { pedido_id, cliente_nombre, cliente_nit, metodo_pago, descuento = 0 } = req.body;

    // Obtener el pedido
    const pedido = await Pedido.findByPk(pedido_id, { transaction: t });

    if (!pedido) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    // Generar número de factura
    const fecha = new Date();
    const count = await Factura.count({ transaction: t });
    const numero_factura = `FAC-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${(count + 1).toString().padStart(5, '0')}`;

    // Calcular totales
    const subtotal = pedido.subtotal;
    const total = subtotal - descuento;

    // Crear factura
    const factura = await Factura.create({
      numero_factura,
      pedido_id,
      cliente_nombre,
      cliente_nit,
      cajero_nombre: req.user.nombre,
      subtotal,
      descuento,
      total,
      metodo_pago,
      estado: 'pagada'
    }, { transaction: t });

    // Actualizar estado del pedido
    await pedido.update({ estado: 'completado' }, { transaction: t });

    await t.commit();

    // Obtener factura completa
    const facturaCompleta = await Factura.findByPk(factura.id, {
      include: [{
        model: Pedido,
        include: [{
          model: DetallePedido,
          include: [{ model: Producto }]
        }]
      }]
    });

    res.status(201).json({
      success: true,
      data: facturaCompleta
    });
  } catch (error) {
    await t.rollback();
    console.error('Error creando factura:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando factura'
    });
  }
};

// Pagar factura
const pagarFactura = async (req, res) => {
  try {
    const { id } = req.params;
    const { metodo_pago } = req.body;

    const factura = await Factura.findByPk(id);

    if (!factura) {
      return res.status(404).json({
        success: false,
        error: 'Factura no encontrada'
      });
    }

    await factura.update({
      estado: 'pagada',
      metodo_pago
    });

    res.json({
      success: true,
      data: factura,
      message: 'Factura pagada correctamente'
    });
  } catch (error) {
    console.error('Error pagando factura:', error);
    res.status(500).json({
      success: false,
      error: 'Error procesando el pago'
    });
  }
};

// Anular factura
const anularFactura = async (req, res) => {
  try {
    const { id } = req.params;

    const factura = await Factura.findByPk(id);

    if (!factura) {
      return res.status(404).json({
        success: false,
        error: 'Factura no encontrada'
      });
    }

    await factura.update({ estado: 'anulada' });

    res.json({
      success: true,
      message: 'Factura anulada correctamente'
    });
  } catch (error) {
    console.error('Error anulando factura:', error);
    res.status(500).json({
      success: false,
      error: 'Error anulando factura'
    });
  }
};

module.exports = {
  getFacturas,
  getFacturaById,
  createFactura,
  pagarFactura,
  anularFactura
};