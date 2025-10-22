// server/controllers/reporteController.js
const { Pedido, Factura, AccesoCajero } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

function startOfDay(d = new Date()) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d = new Date()) { const x = new Date(d); x.setHours(23,59,59,999); return x; }

//
// /api/reportes/mi-reporte  (cajero logueado)
//
const getMiReporteDiario = async (req, res) => {
  try {
    const { nombre } = req.user;
    const start = startOfDay();
    const end = endOfDay();

    const ventas = await Factura.findAll({
      where: { cajero_nombre: nombre, estado: 'pagada', fecha_emision: { [Op.between]: [start, end] } },
      order: [['fecha_emision','ASC']]
    });
    const total = ventas.reduce((s,v)=>s+Number(v.total||0),0);
    const pedidos = await Pedido.findAll({
      where: { cajero_nombre: nombre, fecha_pedido: { [Op.between]: [start, end] } },
      order: [['fecha_pedido','ASC']]
    });

    return res.json({
      success: true,
      data: {
        cajero: nombre,
        fecha: start.toISOString().split('T')[0],
        resumen: {
          total_ventas: Number(total.toFixed(2)),
          cantidad_ventas: ventas.length,
          cantidad_pedidos: pedidos.length,
          promedio_venta: ventas.length ? Number((total/ventas.length).toFixed(2)) : 0,
        },
        ventas, pedidos
      }
    });
  } catch (e) {
    console.error(e);
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

module.exports = {
  getMiReporteDiario,
  getReporteDiario,
  getReporteMensual,
  getReporteCajeros,
};
