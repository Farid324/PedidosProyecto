import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ShoppingCart, DollarSign, Clock, Users, 
  TrendingUp, FileText, UtensilsCrossed, Receipt
} from 'lucide-react'
import useAuthStore from '../../../store/authStore'
import pedidoService from '../../../services/pedidoService'
import menuService from '../../../services/menuService'

function CajeroDashboard() {
  const { user, turno } = useAuthStore()
  const navigate = useNavigate()
  
  const [pedidos, setPedidos] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch today's orders
        const today = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'
        const resPedidos = await pedidoService.getPedidos({ fecha: today })
        
        // Fetch products for popular menu
        const resProductos = await menuService.getProductos()
        
        setPedidos(resPedidos.data || [])
        setProductos(Array.isArray(resProductos) ? resProductos : (resProductos.data || []))
      } catch (error) {
        console.error("Error fetching dashboard data", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate stats
  const pedidosCompletados = pedidos.filter(p => p.estado === 'completado')
  const ventasHoy = pedidosCompletados.reduce((acc, curr) => acc + Number(curr.total), 0)
  const clientesAtendidos = pedidos.length // Total orders today

  const statsCards = [
    { 
      title: 'Mis Ventas Hoy', 
      value: `Bs ${ventasHoy.toFixed(2)}`, 
      change: `${pedidosCompletados.length} cobrados`, 
      icon: DollarSign, 
      color: 'green'
    },
    { 
      title: 'Pedidos Completados', 
      value: pedidosCompletados.length.toString(), 
      change: 'Hoy', 
      icon: ShoppingCart, 
      color: 'blue'
    },
    { 
      title: 'Clientes Atendidos', 
      value: clientesAtendidos.toString(), 
      change: `Turno ${turno}`, 
      icon: Users, 
      color: 'yellow'
    },
  ]

  // Recent orders (top 5)
  const pedidosRecientes = pedidos.slice(0, 5)

  // Popular products (random 4 for now, since we don't have exact order counts per product easily available here)
  const menuRapido = productos.filter(p => p.disponible).slice(0, 4).map(p => ({
    nombre: p.nombre,
    precio: `Bs ${Number(p.precio).toFixed(2)}`,
    categoria: p.Categoria?.nombre || 'Platos',
    icon: UtensilsCrossed
  }))

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar p-1">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--gris-primario)]">Dashboard Pedidos</h1>
          <p className="text-[var(--gris-primario)] mt-1">Gestión de administración de pedidos</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/cajero/reportes')}
            className="bg-[var(--azul-primario)] text-white font-bold p-2 hover:bg-[var(--primary-color)] rounded-md flex items-center gap-2"
          >
            <FileText size={20} />
            Generar Reporte
          </button>
        </div>
      </div>
      
      {/* Header con información del cajero */}
      <div className="card bg-[var(--azul-primario)] rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Bienvenido, {user?.nombre || user?.name}</h1>
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
            <p className="text-sm text-white">Hora actual</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="card hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-${stat.color}-100 p-3 rounded-lg text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
              <span className="text-sm text-[var(--gris-primario)]">
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
            <button onClick={() => navigate('/cajero/pedidos')} className="btn btn-primary w-full justify-start border-none">
              <ShoppingCart size={20} className="mr-2" />
              Nuevo Pedido
            </button>
            <button onClick={() => navigate('/cajero/facturacion')} className="btn btn-secondary w-full justify-start border-none text-[var(--gris-primario)]">
              <Receipt size={20} className="mr-2 text-gray-500" />
              Ver Pedidos
            </button>
            <button onClick={() => navigate('/cajero/reportes')} className="btn btn-secondary w-full justify-start border-none text-[var(--gris-primario)]">
              <TrendingUp size={20} className="mr-2 text-gray-500" />
              Mi Reporte del Día
            </button>
          </div>
        </div>

        {/* Pedidos Recientes */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mis Pedidos Recientes</h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
            {loading ? (
              <p className="text-gray-500 text-center py-4">Cargando pedidos...</p>
            ) : pedidosRecientes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aún no hay pedidos hoy.</p>
            ) : (
              pedidosRecientes.map((pedido) => (
                <div key={pedido.id} onClick={() => navigate('/cajero/facturacion')} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-800">Pedido #{pedido.numero_diario || pedido.id}</p>
                      <p className="text-sm text-gray-600">Mesa {pedido.mesa || '-'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--azul-primario)]">Bs {Number(pedido.total).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{new Date(pedido.created_at).toLocaleTimeString()}</p>
                  </div>
                  <span className={`badge ${
                    pedido.estado === 'completado' ? 'badge-success' :
                    pedido.estado === 'en_proceso' ? 'badge-warning' :
                    'badge-danger'
                  }`}>
                    {pedido.estado === 'completado' ? 'Finalizado' : pedido.estado === 'pendiente' ? 'Registrado' : pedido.estado}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Menú Rápido */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Menú Rápido - Productos Disponibles</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
             <p className="text-gray-500 col-span-4 text-center py-4">Cargando productos...</p>
          ) : menuRapido.length === 0 ? (
            <p className="text-gray-500 col-span-4 text-center py-4">No hay productos disponibles.</p>
          ) : (
            menuRapido.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} onClick={() => navigate('/cajero/pedidos')} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer hover:border-[var(--guindo-primario)]">
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={24} className="text-gray-400" />
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">{item.categoria}</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.nombre}</p>
                  <p className="text-[var(--azul-primario)] font-bold mt-1">{item.precio}</p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Información del Turno */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shrink-0">
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