import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ShoppingCart, DollarSign, Clock, Users, 
  TrendingUp, FileText, UtensilsCrossed, Receipt, X
} from 'lucide-react'
import { createPortal } from 'react-dom'
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs
import useAuthStore from '../../../store/authStore'
import pedidoService from '../../../services/pedidoService'
import menuService from '../../../services/menuService'
import { getLocalDateString } from '../../../utils/dateUtils'

function CajeroDashboard() {
  const { user, turno } = useAuthStore()
  const navigate = useNavigate()
  
  const [pedidos, setPedidos] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch today's orders
        const today = getLocalDateString()
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

  // Pedidos recientes (top 5)
  const pedidosRecientes = pedidos.slice(0, 5)

  // Top 3 Productos Populares
  const productCountMap = {}
  pedidos.forEach(pedido => {
    if (pedido.estado !== 'cancelado' && pedido.DetallePedidos) {
      pedido.DetallePedidos.forEach(detalle => {
        const pId = detalle.producto_id
        if (!productCountMap[pId]) {
          productCountMap[pId] = {
            nombre: detalle.Producto?.nombre || 'Producto Desconocido',
            precio: detalle.precio_unitario,
            categoria: detalle.Producto?.Categoria?.nombre || 'Platos',
            cantidad: 0,
            icon: UtensilsCrossed
          }
        }
        productCountMap[pId].cantidad += Number(detalle.cantidad)
      })
    }
  })

  const topProductos = Object.values(productCountMap)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 3)

  const handleGeneratePDF = () => {
    const documentDefinition = {
      content: [
        { text: 'Restaurante - Reporte de Turno', style: 'header' },
        { text: `Cajero: ${user?.nombre || user?.name}`, style: 'subheader' },
        { text: `Turno: ${turno} | Fecha: ${new Date().toLocaleDateString('es-BO')}`, style: 'subheader' },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', '*', 'auto', 'auto'],
            body: [
              [{text: 'Nro Pedido', bold: true}, {text: 'Fecha', bold: true}, {text: 'Tipo', bold: true}, {text: 'Cliente', bold: true}, {text: 'Método', bold: true}, {text: 'Total', bold: true}],
              ...pedidos.filter(p => p.estado !== 'cancelado').map(p => [
                p.numero_diario?.toString() || p.id?.toString(),
                new Date(p.created_at).toLocaleTimeString('es-BO'),
                p.tipo_pedido === 'llevar' ? 'Para Llevar' : 'Para Mesa',
                p.razon_social || 'S/N',
                p.metodo_pago,
                `Bs ${Number(p.total).toFixed(2)}`
              ])
            ]
          }
        },
        { text: '\n' },
        { text: `Total Ventas: Bs ${ventasHoy.toFixed(2)}`, style: 'totalText' }
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        subheader: { fontSize: 12, margin: [0, 5, 0, 5] },
        totalText: { fontSize: 14, bold: true, alignment: 'right', margin: [0, 10, 0, 0] }
      }
    }
    pdfMake.createPdf(documentDefinition).download(`Reporte_Turno_${turno}_${getLocalDateString()}.pdf`)
    setIsPdfModalOpen(false)
  }

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--gris-primario)]">Dashboard Pedidos</h1>
          <p className="text-[var(--gris-primario)] mt-1">Gestión de administración de pedidos</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsPdfModalOpen(true)}
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
        <div className="card lg:col-span-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
          <div className="flex flex-col gap-3 flex-1">
            <button onClick={() => navigate('/cajero/pedidos')} className="btn btn-primary w-full flex-1 flex items-center justify-start border-none px-4 text-left">
              <ShoppingCart size={22} className="mr-3" />
              <span className="text-base">Nuevo Pedido</span>
            </button>
            <button onClick={() => navigate('/cajero/facturacion')} className="btn btn-secondary w-full flex-1 flex items-center justify-start border-none px-4 text-left text-[var(--gris-primario)]">
              <Receipt size={22} className="mr-3 text-gray-500" />
              <span className="text-base">Ver Pedidos</span>
            </button>
            <button onClick={() => navigate('/cajero/reportes')} className="btn btn-secondary w-full flex-1 flex items-center justify-start border-none px-4 text-left text-[var(--gris-primario)]">
              <TrendingUp size={22} className="mr-3 text-gray-500" />
              <span className="text-base">Mi Reporte del Día</span>
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
                      <p className="font-semibold text-gray-800">Nro Pedido: {pedido.numero_diario || pedido.id}</p>
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

      {/* Platillos más populares */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Platillos más populares (Hoy)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
             <p className="text-gray-500 col-span-3 text-center py-4">Cargando productos...</p>
          ) : topProductos.length === 0 ? (
            <p className="text-gray-500 col-span-3 text-center py-4">No hay ventas registradas hoy en este turno.</p>
          ) : (
            topProductos.map((item, index) => {
              const Icon = item.icon || UtensilsCrossed
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 transition bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={24} className="text-[var(--azul-primario)]" />
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">
                      {item.cantidad} vendidos
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.nombre}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.categoria}</p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* PDF Generation Modal */}
      {isPdfModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Generar Reporte</h3>
              <button onClick={() => setIsPdfModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Quieres descargar un PDF con el reporte del turno actual?
            </p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsPdfModalOpen(false)} 
                className="btn border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleGeneratePDF} 
                className="btn bg-[var(--azul-primario)] text-white font-bold hover:opacity-90"
              >
                Sí, descargar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default CajeroDashboard