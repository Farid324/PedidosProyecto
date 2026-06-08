import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, QrCode, Banknote, Download, Search, Filter } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import api from '../../../services/api';

function ReportesPage() {
  const { role, user } = useAuthStore();
  const [data, setData] = useState({ resumen: {}, ventas: [] });
  const [loading, setLoading] = useState(true);

  // Filtros de fecha
  const [reportType, setReportType] = useState('mensual'); // 'mensual' | 'dia'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Filtros de tabla
  const [searchPedido, setSearchPedido] = useState('');
  const [searchRazon, setSearchRazon] = useState('');
  const [filterPago, setFilterPago] = useState('Todos');
  const [filterTurno, setFilterTurno] = useState('Ambos');

  useEffect(() => {
    fetchReporte();
    const interval = setInterval(() => {
      fetchReporteSilent();
    }, 5000);
    return () => clearInterval(interval);
  }, [reportType, customStart, customEnd]);

  const fetchReporte = async () => {
    setLoading(true);
    try {
      let url = '/reportes/admin-ventas';
      const params = new URLSearchParams();

      if (customStart && customEnd) {
        params.append('startDate', customStart);
        params.append('endDate', customEnd);
      } else if (reportType === 'dia') {
        const today = new Date().toISOString().split('T')[0];
        params.append('startDate', today);
        params.append('endDate', today);
      } else {
        // mensual - the backend handles default correctly
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await api.get(url);
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
      let url = '/reportes/admin-ventas';
      const params = new URLSearchParams();

      if (customStart && customEnd) {
        params.append('startDate', customStart);
        params.append('endDate', customEnd);
      } else if (reportType === 'dia') {
        const today = new Date().toISOString().split('T')[0];
        params.append('startDate', today);
        params.append('endDate', today);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Numero de pedido', 'Fecha de emision', 'Razon Social', 'NIT', 'Monto total', 'Metodo de pago', 'Turno', 'Cajero'];
    const rows = filteredVentas.map(v => [
      v.numero_pedido,
      new Date(v.fecha_emision).toLocaleString(),
      v.razon_social,
      v.nit || 'N/D',
      v.monto_total,
      v.metodo_pago,
      v.turno,
      v.cajero_nombre
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredVentas = data.ventas.filter(v => {
    const matchPedido = v.numero_pedido.toString().includes(searchPedido);
    const matchRazon = v.razon_social.toLowerCase().includes(searchRazon.toLowerCase());
    const matchPago = filterPago === 'Todos' || v.metodo_pago === filterPago;
    const matchTurno = filterTurno === 'Ambos' || v.turno === filterTurno.replace('Turno ', '');
    return matchPedido && matchRazon && matchPago && matchTurno;
  });

  const getTitle = () => {
    if (customStart && customEnd) return `Total del ${customStart} al ${customEnd}`;
    return reportType === 'mensual' ? 'Total mensual' : 'Total del día';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--gris-primario)]">Reportes del sistema</h1>
          <p className="text-[var(--gris-primario)] mt-1">
            Reportes y análisis del restaurant
          </p>
        </div>
      </div>

      {/* Date Filters Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end justify-between">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1 font-medium">Tipo de Reporte</label>
            <select 
              className="input bg-gray-50 border-gray-200 py-2.5"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setCustomStart('');
                setCustomEnd('');
              }}
            >
              <option value="mensual">Reporte Mensual</option>
              <option value="dia">Reporte por día</option>
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1 font-medium">Fecha Inicio</label>
            <input 
              type="date" 
              className="input bg-gray-50 border-gray-200 py-2.5"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1 font-medium">Fecha Fin</label>
            <input 
              type="date" 
              className="input bg-gray-50 border-gray-200 py-2.5"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
        </div>

        <button onClick={handleExportCSV} className="btn btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700 py-2.5 border-0">
          <Download size={20} />
          Exportar (CSV)
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Bs {data.resumen?.total?.toFixed(2) || '0.00'}</h3>
          <p className="text-gray-600 text-sm mt-1">{getTitle()}</p>
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
              <ShoppingCart className="text-orange-600" size={24} />
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
              placeholder="Nro. de Pedido..." 
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
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select 
              className="input max-w-[150px]"
              value={filterTurno}
              onChange={(e) => setFilterTurno(e.target.value)}
            >
              <option value="Ambos">Turno: Ambos</option>
              <option value="Turno AM">Turno AM</option>
              <option value="Turno PM">Turno PM</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <tr>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Nro Pedido</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Fecha de Emisión</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Razón Social</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">NIT</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Monto Total</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Método de Pago</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Cajero</th>
                <th className="py-3 px-4 font-semibold whitespace-nowrap">Turno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">Cargando datos...</td>
                </tr>
              ) : filteredVentas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">No se encontraron ventas con los filtros actuales.</td>
                </tr>
              ) : (
                filteredVentas.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">#{v.numero_pedido}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{new Date(v.fecha_emision).toLocaleString('es-BO')}</td>
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
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{v.cajero_nombre}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{v.turno}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportesPage;