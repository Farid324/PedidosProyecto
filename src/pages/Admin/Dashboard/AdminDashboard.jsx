// src/pages/AdminDashboard.jsx
import { useState } from 'react'
import { 
  ShoppingCart, FileText, Users, 
  DollarSign, Calendar, BarChart3, PieChart,
  Clock, AlertCircle
} from 'lucide-react'
import useAuthStore from '../../../store/authStore'

function AdminDashboard() {
  const { user } = useAuthStore()

  const statsCards = [
    { 
      title: 'Ventas del Día', 
      value: 'Bs 4,850', 
      change: '+12%', 
      icon: DollarSign, 
      color: 'green',
      subtitle: 'vs. ayer'
    },
    { 
      title: 'Pedidos Completados', 
      value: '67', 
      change: '+8', 
      icon: ShoppingCart, 
      color: 'blue',
      subtitle: 'pedidos hoy'
    },
    { 
      title: 'Promedio por Pedido', 
      value: 'Bs 72.38', 
      change: '+5%', 
      icon: BarChart3, 
      color: 'purple',
      subtitle: 'incremento'
    },
    { 
      title: 'Clientes Atendidos', 
      value: '234', 
      change: '+23', 
      icon: Users, 
      color: 'yellow',
      subtitle: 'nuevos hoy'
    },
  ]

  const recentOrders = [
    { id: '001', cliente: 'Mesa 5', total: 'Bs 125', estado: 'completado', hora: '14:30' },
    { id: '002', cliente: 'Delivery - Juan P.', total: 'Bs 89', estado: 'en_proceso', hora: '14:25' },
    { id: '003', cliente: 'Mesa 2', total: 'Bs 156', estado: 'pendiente', hora: '14:20' },
    { id: '004', cliente: 'Mesa 8', total: 'Bs 78', estado: 'completado', hora: '14:15' },
  ]

  const cajerosTurnos = [
    { nombre: 'Carlos Mendoza', turno: 'AM', ventas: 'Bs 1,250', pedidos: 15, estado: 'activo' },
    { nombre: 'Ana García', turno: 'PM', ventas: 'Bs 0', pedidos: 0, estado: 'pendiente' },
    { nombre: 'Luis Fernández', turno: 'AM', ventas: 'Bs 980', pedidos: 12, estado: 'cerrado' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-1">Bienvenido, {user?.name}</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Calendar size={20} />
            Hoy
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <FileText size={20} />
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
                <span className={`text-sm font-semibold text-${stat.color}-600`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
              <p className="text-gray-500 text-xs mt-2">{stat.subtitle}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart size={20} />
            Ventas por Categoría
          </h3>
          <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart size={48} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de ventas por categoría</p>
              <p className="text-xs text-gray-400 mt-1">Bebidas • Platos • Postres</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Pedidos Recientes
          </h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">#{order.id}</p>
                  <p className="text-gray-600 text-xs">{order.cliente}</p>
                </div>
                <div className="text-right mx-3">
                  <p className="font-semibold text-gray-800 text-sm">{order.total}</p>
                  <p className="text-xs text-gray-500">{order.hora}</p>
                </div>
                <span className={`badge ${
                  order.estado === 'completado' ? 'badge-success' :
                  order.estado === 'en_proceso' ? 'badge-warning' :
                  'badge-danger'
                }`}>
                  {order.estado.replace('_', ' ')}
                </span>
              </div>
            ))}
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
              {cajerosTurnos.map((cajero, index) => (
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
                      {cajero.turno === 'AM' ? '☀️' : '🌙'} {cajero.turno}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-gray-800">{cajero.ventas}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{cajero.pedidos} pedidos</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${
                      cajero.estado === 'activo' ? 'badge-success' :
                      cajero.estado === 'pendiente' ? 'badge-warning' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {cajero.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
        <div className="flex-1">
          <p className="text-yellow-800 font-semibold">Recordatorio Importante</p>
          <p className="text-yellow-700 text-sm">
            El cierre de caja del turno AM debe realizarse a las 15:00. 
            Hay 2 facturas pendientes de revisión.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard