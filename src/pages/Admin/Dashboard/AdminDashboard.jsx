import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart, FileText, Users,
  DollarSign, PieChart, Clock, AlertCircle
} from 'lucide-react'
import useAuthStore from '../../../store/authStore'
import api from '../../../services/api'

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
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0])
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
          <input
            type="date"
            className="input bg-white border-gray-200 py-2"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
          <button
            onClick={() => navigate('/admin/reportes')}
            className="btn btn-primary flex items-center gap-2"
          >
            <FileText size={20} />
            Generar Reporte
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
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart size={20} />
            Ventas por Categoría
          </h3>
          {loading ? (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Cargando datos...</p>
            </div>
          ) : data.ventas_por_categoria && data.ventas_por_categoria.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.ventas_por_categoria.map((cat, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];
                const colorClass = colors[index % colors.length];
                // Calculate max value for progress bar width
                const maxVal = Math.max(...data.ventas_por_categoria.map(c => c.value));
                const widthPercent = (cat.value / maxVal) * 100;

                return (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg flex flex-col justify-center">
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
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PieChart size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No hay ventas registradas</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Pedidos Recientes
          </h3>
          <div className="space-y-3">
            {loading ? (
              <p className="text-gray-500 text-sm text-center py-4">Cargando...</p>
            ) : data.pedidos_recientes.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No hay pedidos recientes.</p>
            ) : (
              <>
                {data.pedidos_recientes
                  .slice(0, isPedidosExpanded ? data.pedidos_recientes.length : 3)
                  .map((order) => (
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
                {data.pedidos_recientes.length > 3 && (
                  <button
                    onClick={() => setIsPedidosExpanded(!isPedidosExpanded)}
                    className="w-full mt-2 py-2 text-sm font-semibold text-[var(--azul-primario)] hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                  >
                    {isPedidosExpanded ? 'Ver menos' : `Ver ${data.pedidos_recientes.length - 3} pedidos más`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cajeros y Turnos */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={20} />
          Cajeros y Turnos del Día
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cajero</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Turno</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ventas</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pedidos</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500 text-sm">Cargando cajeros...</td>
                </tr>
              ) : data.cajeros_turnos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500 text-sm">No hay ventas registradas.</td>
                </tr>
              ) : (
                data.cajeros_turnos.map((cajero, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold">
                          {cajero.nombre.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{cajero.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-sm`}>
                        {cajero.turno === 'AM' ? '☀️' : (cajero.turno === 'PM' ? '🌙' : '')} {cajero.turno}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-gray-800">{cajero.ventas}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{cajero.pedidos} pedidos</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${cajero.estado === 'activo' ? 'badge-success' :
                          cajero.estado === 'pendiente' ? 'badge-warning' :
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