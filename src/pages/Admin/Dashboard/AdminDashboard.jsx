import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart, FileText, Users,
  DollarSign, PieChart, Clock, AlertCircle
} from 'lucide-react'
import useAuthStore from '../../../store/authStore'
import api from '../../../services/api'
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { getLocalDateString } from '../../../utils/dateUtils';
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

function AdminDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [data, setData] = useState({
    ventas_del_dia: 'Bs 0.00',
    pedidos_completados: 0,
    clientes_atendidos: 0,
    pedidos_recientes: [],
    ventas_por_categoria: [],
    cajeros_turnos: []
  })
  const [targetDate, setTargetDate] = useState(getLocalDateString())
  const [loading, setLoading] = useState(true)
  const [isPedidosExpanded, setIsPedidosExpanded] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(() => {
      fetchDashboardDataSilent()
    }, 5000)
    return () => clearInterval(interval)
  }, [targetDate])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/reportes/admin-dashboard?date=${targetDate}`)
      if (res.data.success) {
        setData(res.data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardDataSilent = async () => {
    try {
      const res = await api.get(`/reportes/admin-dashboard?date=${targetDate}`)
      if (res.data.success) {
        setData(res.data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const handleExportPDF = () => {
    const documentDefinition = {
      content: [
        { text: 'Reporte Diario General', style: 'header' },
        { text: `Fecha: ${new Date().toLocaleDateString('es-BO')}`, style: 'subheader' },
        { text: '\n' },
        { text: 'Resumen de Ventas por Empleado', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [{text:'Cajero', bold:true}, {text:'Pedidos', bold:true}, {text:'Ventas', bold:true}, {text:'Estado', bold:true}],
              ...data.cajeros_turnos.map(c => [
                c.nombre,
                c.pedidos.toString(),
                c.ventas,
                c.estado === 'activo' ? 'En Turno' : 'Cerrado'
              ])
            ]
          }
        },
        { text: '\n' },
        { text: `Total Recaudado Hoy: ${data.ventas_del_dia}`, style: 'totalText' }
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        subheader: { fontSize: 12, margin: [0, 5, 0, 5] },
        totalText: { fontSize: 14, bold: true, alignment: 'right', margin: [0, 10, 0, 0] }
      }
    };
    pdfMake.createPdf(documentDefinition).download(`reporte_general_${getLocalDateString()}.pdf`);
  };

  const statsCards = [
    {
      title: 'Ventas del Día',
      value: data.ventas_del_dia,
      icon: DollarSign,
      color: 'green',
      subtitle: 'fecha seleccionada'
    },
    {
      title: 'Pedidos Completados',
      value: data.pedidos_completados,
      icon: ShoppingCart,
      color: 'blue',
      subtitle: 'fecha seleccionada'
    },
    {
      title: 'Clientes Atendidos',
      value: data.clientes_atendidos,
      icon: Users,
      color: 'yellow',
      subtitle: 'fecha seleccionada'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--gris-primario)]">Dashboard Administrativo</h1>
          <p className="text-[var(--gris-primario)] mt-1">Bienvenido, {user?.name}</p>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={handleExportPDF} className="btn btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700 border-0">
            <FileText size={20} />
            Generar Reporte (PDF)
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {loading ? '...' : stat.value}
              </h3>
              <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
              <p className="text-gray-500 text-xs mt-2">{stat.subtitle}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ventas por Categoría */}
        <div className="card lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart size={20} />
            Ventas por Categoría
          </h3>
          <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 overflow-y-auto max-h-64 custom-scrollbar">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Cargando datos...</p>
              </div>
            ) : data.ventas_por_categoria && data.ventas_por_categoria.length > 0 ? (
              <div className="space-y-3">
                {data.ventas_por_categoria.map((cat, index) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
                  const colorClass = colors[index % colors.length];
                  // Calculate max value for progress bar width
                  const maxVal = Math.max(...data.ventas_por_categoria.map(c => c.value));
                  const widthPercent = (cat.value / (maxVal || 1)) * 100;

                  return (
                    <div key={index} className="bg-white p-3 rounded-lg flex flex-col justify-center shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-700">{cat.name}</span>
                        <span className="font-bold text-gray-900">Bs {cat.value.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${widthPercent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <PieChart size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No hay categorías registradas</p>
                <p className="text-xs text-gray-400 mt-1">Crea categorías en la sección de inventario para ver las ventas agrupadas.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Pedidos Recientes
          </h3>
          <div className="space-y-3 max-h-[270px] overflow-y-auto custom-scrollbar pr-2">
            {loading ? (
              <p className="text-gray-500 text-sm text-center py-4">Cargando...</p>
            ) : data.pedidos_recientes.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No hay pedidos recientes.</p>
            ) : (
              <>
                {data.pedidos_recientes.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-100">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">#{order.id}</p>
                        <p className="text-gray-600 text-xs">{order.cliente}</p>
                      </div>
                      <div className="text-right mx-3">
                        <p className="font-semibold text-gray-800 text-sm">{order.total}</p>
                        <p className="text-xs text-gray-500">{order.hora}</p>
                      </div>
                      <span className={`badge ${order.estado === 'completado' ? 'badge-success' :
                          order.estado === 'en_proceso' ? 'badge-warning' :
                            'badge-danger'
                        }`}>
                        {order.estado.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cajeros del Día */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={20} />
          Cajeros del Día
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cajero</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ventas</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pedidos</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500 text-sm">Cargando cajeros...</td>
                </tr>
              ) : data.cajeros_turnos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500 text-sm">Ningún cajero activo hoy.</td>
                </tr>
              ) : (
                data.cajeros_turnos.map((cajero, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold uppercase">
                          {cajero.nombre.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{cajero.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-gray-800">{cajero.ventas}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{cajero.pedidos} pedidos</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${cajero.estado === 'activo' ? 'badge-success' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                        {cajero.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard