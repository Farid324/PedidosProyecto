// src/pages/CajeroDashboard.jsx
import { useState } from 'react'
import { 
  ShoppingCart, DollarSign, Clock, Users, 
  TrendingUp, FileText, Coffee, UtensilsCrossed
} from 'lucide-react'
import useAuthStore from '../store/authStore'

function CajeroDashboard() {
  const { user, turno } = useAuthStore()
  const [activeTab, setActiveTab] = useState('resumen')

  // Datos de ejemplo para el cajero
  const statsCards = [
    { 
      title: 'Mis Ventas Hoy', 
      value: 'Bs 1,250', 
      change: '15 pedidos', 
      icon: DollarSign, 
      color: 'green'
    },
    { 
      title: 'Pedidos Activos', 
      value: '3', 
      change: 'En proceso', 
      icon: ShoppingCart, 
      color: 'blue'
    },
    { 
      title: 'Tiempo Promedio', 
      value: '12 min', 
      change: 'Por pedido', 
      icon: Clock, 
      color: 'purple'
    },
    { 
      title: 'Clientes Atendidos', 
      value: '28', 
      change: `Turno ${turno}`, 
      icon: Users, 
      color: 'yellow'
    },
  ]

  const pedidosRecientes = [
    { id: '001', mesa: '5', total: 'Bs 125', estado: 'completado', hora: '14:30' },
    { id: '002', mesa: '2', total: 'Bs 89', estado: 'en_proceso', hora: '14:25' },
    { id: '003', mesa: '8', total: 'Bs 156', estado: 'pendiente', hora: '14:20' },
  ]

  const menuRapido = [
    { nombre: 'Café Americano', precio: 'Bs 12', categoria: 'Bebidas', icon: Coffee },
    { nombre: 'Hamburguesa Clásica', precio: 'Bs 45', categoria: 'Platos', icon: UtensilsCrossed },
    { nombre: 'Pizza Margherita', precio: 'Bs 65', categoria: 'Platos', icon: UtensilsCrossed },
    { nombre: 'Limonada', precio: 'Bs 8', categoria: 'Bebidas', icon: Coffee },
  ]

  return (
    <div className="space-y-6">
      {/* Header con información del cajero */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Bienvenido, {user?.name}</h1>
            <p className="text-blue-100 mt-1">
              Turno {turno} • {new Date().toLocaleDateString('es-BO', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Hora actual</p>
            <p className="text-3xl font-bold">
              {new Date().toLocaleTimeString('es-BO', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="card hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                <stat.icon className={`text-${stat.color}-600`} size={24} />
              </div>
              <span className="text-sm text-gray-500">
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acciones Rápidas */}
        <div className="card lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
          <div className="space-y-2">
            <button className="btn btn-primary w-full justify-start">
              <ShoppingCart size={20} className="mr-2" />
              Nuevo Pedido
            </button>
            <button className="btn btn-secondary w-full justify-start">
              <FileText size={20} className="mr-2" />
              Ver Facturas Pendientes
            </button>
            <button className="btn btn-secondary w-full justify-start">
              <DollarSign size={20} className="mr-2" />
              Registrar Cobro
            </button>
            <button className="btn btn-secondary w-full justify-start">
              <TrendingUp size={20} className="mr-2" />
              Mi Reporte del Día
            </button>
          </div>
        </div>

        {/* Pedidos Recientes */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mis Pedidos Recientes</h3>
          <div className="space-y-3">
            {pedidosRecientes.map((pedido) => (
              <div key={pedido.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">Pedido #{pedido.id}</p>
                    <p className="text-sm text-gray-600">Mesa {pedido.mesa}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{pedido.total}</p>
                  <p className="text-xs text-gray-500">{pedido.hora}</p>
                </div>
                <span className={`badge ${
                  pedido.estado === 'completado' ? 'badge-success' :
                  pedido.estado === 'en_proceso' ? 'badge-warning' :
                  'badge-danger'
                }`}>
                  {pedido.estado.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menú Rápido */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Menú Rápido - Productos Populares</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {menuRapido.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer hover:border-blue-300">
                <div className="flex items-center justify-between mb-2">
                  <Icon size={24} className="text-gray-600" />
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.categoria}</span>
                </div>
                <p className="font-semibold text-gray-800 text-sm">{item.nombre}</p>
                <p className="text-blue-600 font-bold mt-1">{item.precio}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Información del Turno */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-800 font-semibold">Información del Turno</p>
            <p className="text-blue-700 text-sm mt-1">
              Recuerda cerrar tu turno al finalizar tu jornada laboral. 
              Turno {turno === 'AM' ? 'mañana hasta las 15:00' : 'tarde hasta las 23:00'}.
            </p>
          </div>
          <Clock className="text-blue-600" size={24} />
        </div>
      </div>
    </div>
  )
}

export default CajeroDashboard