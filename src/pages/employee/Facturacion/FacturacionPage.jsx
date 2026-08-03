import { useState, useEffect } from 'react'
import { Eye, Trash2, Search, Receipt } from 'lucide-react'
import pedidoService from '../../../services/pedidoService'
import TextInput from '../../../components/common/inputs/TextInput'
import DetallePedidoModal from '../../../components/pedidos/DetallePedidoModal'
import EliminarPedidoModal from '../../../components/pedidos/EliminarPedidoModal'

// Skeleton loader para la tabla
function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded-lg w-10" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-gray-200 rounded w-40" />
            <div className="h-3 bg-gray-100 rounded w-24" />
          </div>
          <div className="h-5 bg-gray-200 rounded w-20" />
          <div className="space-y-1.5">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-100 rounded w-16" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded-lg" />
            <div className="h-8 w-8 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function FacturacionPage() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('registrados') // 'registrados' | 'finalizados'
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modals state
  const [detalleModalOpen, setDetalleModalOpen] = useState(false)
  const [selectedPedido, setSelectedPedido] = useState(null)
  
  const [eliminarModalOpen, setEliminarModalOpen] = useState(false)
  const [pedidoToDelete, setPedidoToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchPedidos = async () => {
    setLoading(true)
    try {
      const estado = tab === 'registrados' ? 'pendiente' : 'completado'
      const response = await pedidoService.getPedidos({ estado })
      setPedidos(response.data || [])
    } catch (error) {
      console.error("Error al cargar pedidos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPedidos()
  }, [tab])

  const filteredPedidos = pedidos.filter(p => {
    const term = searchTerm.toLowerCase()
    return (
      (p.razon_social || '').toLowerCase().includes(term) ||
      String(p.mesa || '').includes(term) ||
      String(p.numero_diario || p.id).includes(term)
    )
  })

  // Acciones
  const handleView = (pedido) => {
    setSelectedPedido(pedido)
    setDetalleModalOpen(true)
  }

  const handleDeleteClick = (pedido) => {
    setPedidoToDelete(pedido)
    setEliminarModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!pedidoToDelete) return
    setIsDeleting(true)
    try {
      await pedidoService.cancelPedido(pedidoToDelete.id)
      setEliminarModalOpen(false)
      setPedidoToDelete(null)
      fetchPedidos()
    } catch (error) {
      console.error("Error eliminando pedido:", error)
      alert("No se pudo eliminar el pedido.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--gris-primario)]">Gestión de Pedidos</h1>
          <p className="text-[var(--gris-primario)] mt-1">Revisa y administra los pedidos registrados y finalizados</p>
        </div>
      </div>

      {/* Card contenedor de la lista (estilo Reportes) */}
      <div className="card space-y-4">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-3">Lista de Pedidos</h3>

        {/* Tabs y Search */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setTab('registrados')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                tab === 'registrados' 
                  ? 'bg-white text-[var(--guindo-primario)] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            >
              Registrados
            </button>
            <button
              onClick={() => setTab('finalizados')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                tab === 'finalizados' 
                  ? 'bg-white text-[var(--guindo-primario)] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            >
              Finalizados
            </button>
          </div>
          <div className="w-full sm:w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por cliente, mesa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--guindo-primario)] focus:border-transparent text-sm bg-white"
            />
          </div>
        </div>

        {/* Tabla dentro del card */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          {loading ? (
            <TableSkeleton />
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <tr>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">ID / Nro</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Mesa</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Cliente</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Total (Bs)</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap">Fecha</th>
                  <th className="py-3 px-4 font-semibold whitespace-nowrap text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPedidos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400">
                      <Receipt size={48} className="mx-auto mb-3 opacity-30" />
                      <p>No se encontraron pedidos {tab === 'registrados' ? 'registrados' : 'finalizados'}.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPedidos.map(pedido => (
                    <tr key={pedido.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap text-base">
                        #{pedido.numero_diario || pedido.id}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 bg-[var(--azul-secundario)] text-[var(--azul-primario)] font-bold rounded-lg text-base">
                          {pedido.mesa || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-base font-medium text-gray-800">{pedido.razon_social || 'Sin nombre'}</div>
                        {pedido.nit && <div className="text-sm text-gray-500">NIT: {pedido.nit}</div>}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[var(--azul-primario)] whitespace-nowrap text-base">
                        Bs {Number(pedido.total).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-base text-gray-700">{new Date(pedido.created_at).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{new Date(pedido.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(pedido)}
                            className="p-2 text-gray-400 hover:text-[var(--azul-primario)] hover:bg-[var(--azul-secundario)] rounded-lg transition-colors"
                            title="Ver Detalle"
                          >
                            <Eye size={18} />
                          </button>
                          {tab === 'registrados' && (
                            <button
                              onClick={() => handleDeleteClick(pedido)}
                              className="p-2 text-gray-400 hover:text-[var(--guindo-primario)] hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar Pedido"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <DetallePedidoModal 
        isOpen={detalleModalOpen} 
        onClose={() => setDetalleModalOpen(false)} 
        pedido={selectedPedido} 
      />

      <EliminarPedidoModal 
        isOpen={eliminarModalOpen}
        onClose={() => setEliminarModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

    </div>
  )
}