// server/controllers/reporteController.js
const { Pedido, Factura, AccesoCajero, DetallePedido, Producto, Categoria } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

function startOfDay(d = new Date()) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d = new Date()) { const x = new Date(d); x.setHours(23,59,59,999); return x; }

//
// /api/reportes/mi-reporte  (cajero logueado)
//
const getMiReporteDiario = async (req, res) => {
  try {
    const { nombre } = req.user;
    
    let start, end;
    if (req.query.startDate && req.query.endDate) {
      start = startOfDay(new Date(req.query.startDate + 'T00:00:00'));
      end = endOfDay(new Date(req.query.endDate + 'T00:00:00'));
    } else {
      const targetDate = req.query.date ? new Date(req.query.date + 'T00:00:00') : new Date();
      start = startOfDay(targetDate);
      end = endOfDay(targetDate);
    }

    let facturas = await Factura.findAll({
      where: { 
        cajero_nombre: nombre, 
        estado: 'pagada', 
        fecha_emision: { [Op.between]: [start, end] } 
      },
      include: [
        {
          model: Pedido,
          attributes: ['turno', 'id', 'tipo_pedido']
        }
      ],
      order: [['fecha_emision','DESC']]
    });

    // Filtrar estricamente por el turno actual del cajero (Aislamiento de turno)
    if (req.user.turno) {
      facturas = facturas.filter(f => {
        const turnoPedido = f.Pedido ? f.Pedido.turno : null;
        return turnoPedido === req.user.turno;
      });
    }

    let total = 0;
    let total_qr = 0;
    let total_efectivo = 0;
    const pedidosSet = new Set();
    let turno_trabajado = 'N/D';

    const ventas = facturas.map(f => {
      const monto = Number(f.total || 0);
      total += monto;
      if (f.metodo_pago === 'QR') total_qr += monto;
      if (f.metodo_pago === 'EFECTIVO') total_efectivo += monto;
      if (f.pedido_id) pedidosSet.add(f.pedido_id);

      const turno = f.Pedido ? f.Pedido.turno : 'N/D';
      if (turno !== 'N/D') turno_trabajado = turno;

      return {
        id: f.id,
        numero_reporte: f.numero_factura || `FAC-${f.id}`,
        numero_pedido: f.Pedido ? f.Pedido.id : f.pedido_id,
        fecha_emision: f.fecha_emision,
        razon_social: f.cliente_nombre,
        nit: f.cliente_nit,
        monto_total: monto,
        metodo_pago: f.metodo_pago,
        cajero_nombre: f.cajero_nombre,
        turno: turno,
        tipo_pedido: f.Pedido ? f.Pedido.tipo_pedido : 'mesa'
      };
    });

    if (turno_trabajado === 'N/D') {
      const acceso = await AccesoCajero.findOne({
        where: { nombre_cajero: nombre, fecha_ingreso: { [Op.between]: [start, end] } }
      });
      if (acceso) {
        turno_trabajado = acceso.turno;
      }
    }

    return res.json({
      success: true,
      data: {
        cajero: nombre,
        fecha: start.toISOString().split('T')[0],
        turno: turno_trabajado,
        resumen: {
          total: Number(total.toFixed(2)),
          total_qr: Number(total_qr.toFixed(2)),
          total_efectivo: Number(total_efectivo.toFixed(2)),
          total_pedidos: pedidosSet.size
        },
        ventas
      }
    });
  } catch (e) {
    console.error('Error en getMiReporteDiario:', e);
    return res.status(500).json({ success:false, message:'Error obteniendo mi reporte diario' });
  }
};

//
// /api/reportes/diario?date=YYYY-MM-DD   (ADMIN)
//
const getReporteDiario = async (req, res) => {
  try {
    const base = req.query?.date ? new Date(req.query.date) : new Date();
    const start = startOfDay(base);
    const end = endOfDay(base);

    const facturas = await Factura.findAll({
      where: { estado:'pagada', fecha_emision: { [Op.between]: [start, end] } },
      order: [['fecha_emision','ASC']]
    });
    const total = facturas.reduce((s,f)=>s+Number(f.total||0),0);

    // por método de pago
    const porMetodo = await Factura.findAll({
      attributes: ['metodo_pago', [fn('sum', col('total')), 'monto'], [fn('count', col('id')), 'cantidad']],
      where: { estado:'pagada', fecha_emision: { [Op.between]: [start, end] } },
      group: ['metodo_pago'], raw:true
    });

    // serie por hora (SQLite)
    const porHora = await Factura.findAll({
      attributes: [
        [fn('strftime','%H', col('fecha_emision')), 'hora'],
        [fn('sum', col('total')), 'monto'],
        [fn('count', col('id')), 'cantidad']
      ],
      where: { estado:'pagada', fecha_emision: { [Op.between]: [start, end] } },
      group: [literal("strftime('%H', fecha_emision)")],
      order: [literal("strftime('%H', fecha_emision)")],
      raw:true
    });
    const serie_hora = [...Array(24).keys()].map(h=>{
      const hh = String(h).padStart(2,'0');
      const r = porHora.find(x=>x.hora===hh);
      return { hora:hh, monto:r?Number(Number(r.monto).toFixed(2)):0, cantidad:r?Number(r.cantidad):0 };
    });

    const pedidos = await Pedido.findAll({ where: { fecha_pedido: { [Op.between]: [start, end] } } });

    return res.json({
      success:true,
      data:{
        fecha: start.toISOString().split('T')[0],
        resumen:{
          total_ventas: Number(total.toFixed(2)),
          cantidad_ventas: facturas.length,
          cantidad_pedidos: pedidos.length,
          promedio_venta: facturas.length ? Number((total/facturas.length).toFixed(2)) : 0
        },
        por_metodo: porMetodo.map(r=>({
          metodo_pago: r.metodo_pago || 'N/D',
          monto: Number(Number(r.monto||0).toFixed(2)),
          cantidad: Number(r.cantidad||0)
        })),
        serie_hora,
        facturas
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success:false, message:'Error en reporte diario' });
  }
};

//
// /api/reportes/mensual?year=YYYY&month=1-12  (ADMIN)
//
const getReporteMensual = async (req, res) => {
  try {
    const now = new Date();
    const year = Number(req.query.year || now.getFullYear());
    const month = Number(req.query.month || (now.getMonth()+1)); // 1..12
    const start = new Date(Date.UTC(year, month-1, 1));
    const end = new Date(Date.UTC(year, month, 0, 23,59,59,999));

    const facturas = await Factura.findAll({
      where: { estado:'pagada', fecha_emision: { [Op.between]: [start, end] } },
      order: [['fecha_emision','ASC']]
    });
    const total = facturas.reduce((s,f)=>s+Number(f.total||0),0);

    // serie por día (SQLite)
    const porDia = await Factura.findAll({
      attributes: [
        [fn('strftime','%d', col('fecha_emision')), 'dia'],
        [fn('sum', col('total')), 'monto'],
        [fn('count', col('id')), 'cantidad']
      ],
      where: { estado:'pagada', fecha_emision: { [Op.between]: [start, end] } },
      group: [literal("strftime('%d', fecha_emision)")],
      order: [literal("strftime('%d', fecha_emision)")],
      raw:true
    });

    const lastDay = new Date(year, month, 0).getDate();
    const serie_dia = Array.from({length:lastDay}, (_,i)=>{
      const dd = String(i+1).padStart(2,'0');
      const r = porDia.find(x=>x.dia===dd);
      return { dia:dd, monto:r?Number(Number(r.monto).toFixed(2)):0, cantidad:r?Number(r.cantidad):0 };
    });

    return res.json({
      success:true,
      data:{
        year, month,
        resumen:{
          total_ventas: Number(total.toFixed(2)),
          cantidad_ventas: facturas.length,
          promedio_venta: facturas.length ? Number((total/facturas.length).toFixed(2)) : 0
        },
        serie_dia,
        facturas
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success:false, message:'Error en reporte mensual' });
  }
};

//
// /api/reportes/cajeros?from=YYYY-MM-DD&to=YYYY-MM-DD  (ADMIN)
//
const getReporteCajeros = async (req, res) => {
  try {
    const from = req.query?.from ? new Date(req.query.from) : startOfDay();
    const to = req.query?.to ? new Date(req.query.to) : endOfDay();

    const rows = await Factura.findAll({
      attributes: [
        'cajero_nombre',
        [fn('sum', col('total')), 'monto'],
        [fn('count', col('id')), 'cantidad']
      ],
      where: { estado:'pagada', fecha_emision: { [Op.between]: [from, to] } },
      group: ['cajero_nombre'],
      order: [[literal('monto'),'DESC']],
      raw:true
    });

    const cajeros = rows.map(r=>({
      cajero: r.cajero_nombre || 'N/D',
      total: Number(Number(r.monto||0).toFixed(2)),
      ventas: Number(r.cantidad||0),
      promedio_ticket: Number(((Number(r.monto||0))/(Number(r.cantidad||0)||1)).toFixed(2))
    }));

    return res.json({ success:true, data:{ from:from.toISOString(), to:to.toISOString(), cajeros }});
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success:false, message:'Error en reporte por cajeros' });
  }
};

const getReportesAdministrador = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let start, end;
    if (startDate && endDate) {
      start = startOfDay(new Date(startDate + 'T00:00:00'));
      end = endOfDay(new Date(endDate + 'T00:00:00'));
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    }

    const facturas = await Factura.findAll({
      where: {
        estado: 'pagada',
        fecha_emision: { [Op.between]: [start, end] }
      },
      include: [
        {
          model: Pedido,
          attributes: ['turno', 'id', 'tipo_pedido']
        }
      ],
      order: [['fecha_emision', 'DESC']]
    });

    let total = 0;
    let total_qr = 0;
    let total_efectivo = 0;
    const pedidosSet = new Set();

    const ventas = facturas.map(f => {
      const monto = Number(f.total || 0);
      total += monto;
      if (f.metodo_pago === 'QR') total_qr += monto;
      if (f.metodo_pago === 'EFECTIVO') total_efectivo += monto;
      if (f.pedido_id) pedidosSet.add(f.pedido_id);

      return {
        id: f.id,
        numero_reporte: f.numero_factura || `FAC-${f.id}`,
        numero_pedido: f.Pedido ? f.Pedido.id : f.pedido_id,
        fecha_emision: f.fecha_emision,
        razon_social: f.cliente_nombre,
        nit: f.cliente_nit,
        monto_total: monto,
        metodo_pago: f.metodo_pago,
        cajero_nombre: f.cajero_nombre,
        turno: f.Pedido ? f.Pedido.turno : 'N/D',
        tipo_pedido: f.Pedido ? f.Pedido.tipo_pedido : 'mesa'
      };
    });

    return res.json({
      success: true,
      data: {
        resumen: {
          total: Number(total.toFixed(2)),
          total_qr: Number(total_qr.toFixed(2)),
          total_efectivo: Number(total_efectivo.toFixed(2)),
          total_pedidos: pedidosSet.size
        },
        ventas
      }
    });

  } catch (error) {
    console.error('Error en getReportesAdministrador:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener reportes del administrador' });
  }
};

const getDashboardAdministrador = async (req, res) => {
  try {
    const targetDate = req.query.date ? new Date(req.query.date + 'T00:00:00') : new Date();
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    // Ventas del día
    const facturas = await Factura.findAll({
      where: { estado: 'pagada', fecha_emision: { [Op.between]: [start, end] } }
    });
    const ventas_del_dia = facturas.reduce((sum, f) => sum + Number(f.total || 0), 0);

    // Pedidos Completados
    const pedidos = await Pedido.findAll({
      where: { estado: 'completado', fecha_pedido: { [Op.between]: [start, end] } }
    });
    const pedidos_completados = pedidos.length;

    // Clientes Atendidos (podemos usar el número de pedidos en general como aproximación)
    const clientes_atendidos = await Pedido.count({
      where: { fecha_pedido: { [Op.between]: [start, end] } }
    });

    // Pedidos Recientes
    const recientes = await Pedido.findAll({
      where: { fecha_pedido: { [Op.between]: [start, end] } },
      order: [['fecha_pedido', 'DESC']],
      limit: 10
    });

    const pedidos_recientes = recientes.map(p => {
      // Create local time string safely
      const hora = new Date(p.fecha_pedido).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
      return {
        id: p.id,
        cliente: p.tipo_pedido === 'mesa' ? `Mesa ${p.mesa}` : p.razon_social,
        total: `Bs ${Number(p.total || 0).toFixed(2)}`,
        estado: p.estado,
        hora: hora !== 'Invalid Date' ? hora : ''
      };
    });

    // Ventas por categoría
    const detalles = await DetallePedido.findAll({
      include: [
        {
          model: Pedido,
          required: true,
          where: { estado: 'completado', fecha_pedido: { [Op.between]: [start, end] } }
        },
        {
          model: Producto,
          include: [{ model: Categoria, as: 'categoria' }]
        }
      ]
    });
    const todasCategorias = await Categoria.findAll();
    const catMap = {};
    todasCategorias.forEach(c => {
      catMap[c.nombre] = 0;
    });

    for (let d of detalles) {
      const catName = d.Producto?.categoria?.nombre || 'Otros';
      if (catMap[catName] === undefined) catMap[catName] = 0;
      catMap[catName] += Number(d.subtotal || 0);
    }
    const ventas_por_categoria = Object.keys(catMap).map(k => ({
      name: k,
      value: Number(catMap[k].toFixed(2))
    }));

    // Cajeros y Turnos
    const accesos = await AccesoCajero.findAll({
      where: { fecha_ingreso: { [Op.between]: [start, end] } },
      order: [['fecha_ingreso', 'ASC']]
    });

    const turnosRows = await Factura.findAll({
      attributes: [
        'cajero_nombre',
        [fn('sum', col('total')), 'monto'],
        [fn('count', col('id')), 'cantidad']
      ],
      where: { estado: 'pagada', fecha_emision: { [Op.between]: [start, end] } },
      group: ['cajero_nombre'],
      raw: true
    });

    const salesMap = {};
    turnosRows.forEach(r => {
      salesMap[r.cajero_nombre] = {
        monto: Number(r.monto || 0),
        cantidad: Number(r.cantidad || 0)
      };
    });

    const cajerosUnicos = new Map();
    accesos.forEach(a => {
      cajerosUnicos.set(a.nombre_cajero, {
        nombre: a.nombre_cajero,
        ventas: `Bs ${Number(salesMap[a.nombre_cajero]?.monto || 0).toFixed(2)}`,
        pedidos: salesMap[a.nombre_cajero]?.cantidad || 0,
        estado: a.fecha_salida ? 'inactivo' : 'activo'
      });
    });

    turnosRows.forEach(r => {
      if (!cajerosUnicos.has(r.cajero_nombre)) {
        cajerosUnicos.set(r.cajero_nombre, {
          nombre: r.cajero_nombre || 'N/D',
          ventas: `Bs ${Number(r.monto || 0).toFixed(2)}`,
          pedidos: r.cantidad || 0,
          estado: 'N/D'
        });
      }
    });

    const cajeros_turnos = Array.from(cajerosUnicos.values());

    return res.json({
      success: true,
      data: {
        ventas_del_dia: `Bs ${ventas_del_dia.toFixed(2)}`,
        pedidos_completados,
        clientes_atendidos,
        pedidos_recientes,
        ventas_por_categoria,
        cajeros_turnos
      }
    });

  } catch (error) {
    console.error('Error en getDashboardAdministrador:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener dashboard del administrador' });
  }
};

const limpiarHistorialAntiguo = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const facturas = await Factura.findAll({
      where: {
        fecha_emision: { [Op.lt]: sixMonthsAgo }
      }
    });

    const pedidoIds = facturas.map(f => f.pedido_id).filter(id => id != null);
    const facturaIds = facturas.map(f => f.id);

    if (facturaIds.length > 0) {
      await Factura.destroy({ where: { id: facturaIds } });
    }

    if (pedidoIds.length > 0) {
      await Pedido.destroy({ where: { id: pedidoIds } });
    }

    return res.json({ 
      success: true, 
      message: `Se han eliminado ${facturaIds.length} reportes/facturas y sus pedidos asociados con más de 6 meses de antigüedad.`
    });
  } catch (error) {
    console.error('Error en limpiarHistorialAntiguo:', error);
    return res.status(500).json({ success: false, message: 'Error al limpiar el historial antiguo' });
  }
};

module.exports = {
  getMiReporteDiario,
  getReporteDiario,
  getReporteMensual,
  getReporteCajeros,
  getReportesAdministrador,
  getDashboardAdministrador,
  limpiarHistorialAntiguo
};
