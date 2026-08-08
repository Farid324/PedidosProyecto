import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DollarSign, ShoppingCart, QrCode, Banknote, Download, Search, Filter, Eye, X, FileText, Printer, CreditCard } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import api from '../../../services/api';
import { getLocalDateString } from '../../../utils/dateUtils';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { printShiftReceipt } from '../../../utils/printHelpers';
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

function ReportesPage() {
  const { role, user, turno } = useAuthStore();
  const [data, setData] = useState({ resumen: {}, ventas: [] });
  const [loading, setLoading] = useState(true);

  // Filtros de fecha
  const [period, setPeriod] = useState('hoy');
  const [startDate, setStartDate] = useState(getLocalDateString());
  const [endDate, setEndDate] = useState(getLocalDateString());

  useEffect(() => {
    const today = new Date();
    if (period === 'hoy') {
      const dateStr = getLocalDateString(today);
      setStartDate(dateStr);
      setEndDate(dateStr);
    } else if (period === 'ayer') {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      const dateStr = getLocalDateString(ayer);
      setStartDate(dateStr);
      setEndDate(dateStr);
    } else if (period === 'mes') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(getLocalDateString(firstDay));
      setEndDate(getLocalDateString(today));
    }
  }, [period]);

  // Detalle Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetalle, setSelectedDetalle] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Filtros de tabla
  const [searchPedido, setSearchPedido] = useState('');
  const [searchRazon, setSearchRazon] = useState('');
  const [filterPago, setFilterPago] = useState('Todos');

  useEffect(() => {
    fetchReporte();
    const interval = setInterval(() => {
      fetchReporteSilent();
    }, 5000);
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  const fetchReporte = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reportes/mi-reporte?startDate=${startDate}&endDate=${endDate}&_t=${Date.now()}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReporteSilent = async () => {
    try {
      const res = await api.get(`/reportes/mi-reporte?startDate=${startDate}&endDate=${endDate}&_t=${Date.now()}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching report (silent):', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Numero de reporte', 'Numero de pedido', 'Fecha de emision', 'Razon Social', 'NIT', 'Monto total', 'Metodo de pago'];
    const rows = filteredVentas.map(v => [
      v.numero_reporte,
      v.numero_pedido,
      new Date(v.fecha_emision).toLocaleString(),
      v.razon_social,
      v.nit || 'N/D',
      v.monto_total,
      v.metodo_pago
    ]);

    const periodLabel = period === 'hoy' ? 'Hoy' : period === 'ayer' ? 'Ayer' : period === 'mes' ? 'Este_Mes' : `${startDate}_a_${endDate}`;
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mi_reporte_ventas_${periodLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const periodLabel = period === 'hoy' ? 'Hoy' : period === 'ayer' ? 'Ayer' : period === 'mes' ? 'Este_Mes' : `${startDate}_a_${endDate}`;
    
    const documentDefinition = {
      content: [
        { text: 'Reporte de Ventas', style: 'header' },
        { text: `Cajero: ${user?.nombre || user?.name}`, style: 'subheader' },
        { text: `Período: ${periodLabel.replace(/_/g, ' ')}`, style: 'subheader' },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
            body: [
              [{text:'Nro Reporte', bold:true}, {text:'Nro Pedido', bold:true}, {text:'Fecha', bold:true}, {text:'Cliente', bold:true}, {text:'NIT', bold:true}, {text:'Total', bold:true}, {text:'Método', bold:true}],
              ...filteredVentas.map(v => [
                v.numero_reporte,
                v.numero_pedido?.toString() || 'N/D',
                new Date(v.fecha_emision).toLocaleString('es-BO'),
                v.razon_social || 'S/N',
                v.nit || 'N/D',
                `Bs ${Number(v.monto_total).toFixed(2)}`,
                v.metodo_pago
              ])
            ]
          }
        },
        { text: '\n' },
        { text: `Total Ventas: Bs ${data.resumen?.total?.toFixed(2) || '0.00'}`, style: 'totalText' }
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        subheader: { fontSize: 12, margin: [0, 5, 0, 5] },
        totalText: { fontSize: 14, bold: true, alignment: 'right', margin: [0, 10, 0, 0] }
      },
      pageOrientation: 'landscape'
    };
    pdfMake.createPdf(documentDefinition).download(`mi_reporte_ventas_${periodLabel}.pdf`);
  };

  const handlePrintShiftReceipt = () => {
    const printData = {
      cajero: user?.nombre || user?.name,
      fecha: startDate,
      turno: data.turno !== 'N/D' ? data.turno : turno,
      resumen: data.resumen
    };
    printShiftReceipt(printData);
  };

  const filteredVentas = data.ventas.filter(v => {
    const matchPedido = v.numero_pedido?.toString().includes(searchPedido) || v.numero_reporte?.toLowerCase().includes(searchPedido.toLowerCase());
    const matchRazon = v.razon_social?.toLowerCase().includes(searchRazon.toLowerCase());
    const matchPago = filterPago === 'Todos' || v.metodo_pago === filterPago;
    return matchPedido && matchRazon && matchPago;
  });

  const handleVerDetalles = async (pedidoId) => {
    if (!pedidoId) return;
    setIsModalOpen(true);
    setModalLoading(true);
    setSelectedDetalle(null);
    try {
      const res = await api.get(`/pedidos/${pedidoId}`);
      if (res.data.success) {
        setSelectedDetalle(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching detalle:', error);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--gris-primario)]">Mi Reporte de Ventas</h1>
          <p className="text-[var(--gris-primario)] mt-1">
            Reporte de {user?.nombre || user?.name} - {data.turno !== 'N/D' ? `Turno ${data.turno}` : `Turno ${turno}`}
          </p>
        </div>
      </div>

      {/* Date Filters Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end justify-between">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1 font-medium">Seleccionar Período</label>
            <select 
              className="input bg-gray-50 border-gray-200 py-2.5 min-w-[200px]"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="hoy">Hoy</option>
              <option value="ayer">Ayer</option>
              <option value="mes">Este Mes</option>
              <option value="rango">Rango Personalizado</option>
            </select>
          </div>

          {period === 'rango' && (
            <>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1 font-medium">Fecha Inicio</label>
                <input 
                  type="date" 
                  className="input bg-gray-50 border-gray-200 py-2.5"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1 font-medium">Fecha Fin</label>
                <input 
                  type="date" 
                  className="input bg-gray-50 border-gray-200 py-2.5"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700 py-2.5 border-0">
            <Download size={20} />
            CSV
          </button>
          <button onClick={handleExportPDF} className="btn btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700 py-2.5 border-0">
            <FileText size={20} />
            PDF
          </button>
          <button onClick={handlePrintShiftReceipt} className="btn btn-primary flex items-center gap-2 bg-blue-600 hover:bg-blue-700 py-2.5 border-0">
            <Printer size={20} />
            Imprimir Cierre
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Bs {data.resumen?.total?.toFixed(2) || '0.00'}</h3>
          <p className="text-gray-600 text-sm mt-1">Total del Turno</p>
        </div>

        <div className="card hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <QrCode className="text-purple-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Bs {data.resumen?.total_qr?.toFixed(2) || '0.00'}</h3>
          <p className="text-gray-600 text-sm mt-1">Con QR</p>
        </div>

        <div className="card hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Banknote className="text-green-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Bs {data.resumen?.total_efectivo?.toFixed(2) || '0.00'}</h3>
          <p className="text-gray-600 text-sm mt-1">Efectivo</p>
        </div>

        <div className="card hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <CreditCard className="text-orange-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Bs {data.resumen?.total_tarjeta?.toFixed(2) || '0.00'}</h3>
          <p className="text-gray-600 text-sm mt-1">Tarjeta/Otro</p>
        </div>

        <div className="card hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <ShoppingCart className="text-yellow-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{data.resumen?.total_pedidos || 0}</h3>
          <p className="text-gray-600 text-sm mt-1">Total Pedidos</p>
        </div>
      </div>

      {/* Table section */}
      <div className="card space-y-4">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-3">Resumen de Ventas</h3>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Nro. Reporte/Pedido..." 
              className="input pl-10"
              value={searchPedido}
              onChange={(e) => setSearchPedido(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Razón Social..." 
              className="input pl-10"
              value={searchRazon}
              onChange={(e) => setSearchRazon(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select 
              className="input max-w-[150px]"
              value={filterPago}
              onChange={(e) => setFilterPago(e.target.value)}
            >
              <option value="Todos">Metodo: Todos</option>
              <option value="QR">Por QR</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta/Otro</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <tr>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Nro Reporte</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Nro Pedido</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Fecha de Emisión</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Tipo</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Razón Social</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">NIT</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Monto Total</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Método de Pago</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-500">Cargando datos...</td>
                </tr>
              ) : filteredVentas.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-500">No se encontraron ventas para esta fecha.</td>
                </tr>
              ) : (
                filteredVentas.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap">{v.numero_reporte}</td>
                    <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">#{v.numero_pedido}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{new Date(v.fecha_emision).toLocaleString('es-BO')}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                        v.tipo_pedido === 'llevar' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {v.tipo_pedido === 'llevar' ? 'Para Llevar' : 'Para Mesa'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800 whitespace-nowrap">{v.razon_social}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{v.nit || 'S/N'}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap">Bs {Number(v.monto_total).toFixed(2)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        v.metodo_pago === 'QR' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {v.metodo_pago}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button 
                        onClick={() => handleVerDetalles(v.numero_pedido)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Detalles del Pedido</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {modalLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : selectedDetalle ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500">Mesa / Tipo</p>
                      <p className="font-semibold text-gray-800">
                        {selectedDetalle.tipo_pedido === 'llevar' ? 'Para Llevar' : `Mesa ${selectedDetalle.mesa}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cajero</p>
                      <p className="font-semibold text-gray-800">{selectedDetalle.cajero_nombre} (Turno {selectedDetalle.turno})</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cliente</p>
                      <p className="font-semibold text-gray-800">{selectedDetalle.razon_social || 'N/D'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">NIT</p>
                      <p className="font-semibold text-gray-800">{selectedDetalle.nit || 'N/D'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Platillos Consumidos</h3>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-sm">
                          <tr>
                            <th className="py-2 px-4 font-semibold text-gray-600">Platillo</th>
                            <th className="py-2 px-4 font-semibold text-gray-600 text-center">Cant.</th>
                            <th className="py-2 px-4 font-semibold text-gray-600 text-right">Precio</th>
                            <th className="py-2 px-4 font-semibold text-gray-600 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedDetalle.DetallePedidos?.map((item) => (
                            <tr key={item.id} className="text-sm">
                              <td className="py-3 px-4">
                                <span className="font-medium text-gray-800">{item.Producto?.nombre}</span>
                                {item.observaciones && (
                                  <span className="block text-xs text-gray-500 mt-0.5">Nota: {item.observaciones}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center font-medium">{item.cantidad}</td>
                              <td className="py-3 px-4 text-right text-gray-600">Bs {Number(item.precio_unitario).toFixed(2)}</td>
                              <td className="py-3 px-4 text-right font-semibold text-gray-800">Bs {Number(item.subtotal).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t border-gray-200">
                          <tr>
                            <td colSpan="3" className="py-3 px-4 text-right font-bold text-gray-600">Total</td>
                            <td className="py-3 px-4 text-right font-bold text-gray-900 text-lg">
                              Bs {Number(selectedDetalle.total).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                  
                  {selectedDetalle.observaciones && (
                    <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl">
                      <p className="text-sm font-semibold text-yellow-800 mb-1">Notas Generales del Pedido:</p>
                      <p className="text-sm text-yellow-700">{selectedDetalle.observaciones}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">No se pudieron cargar los detalles.</div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ReportesPage;