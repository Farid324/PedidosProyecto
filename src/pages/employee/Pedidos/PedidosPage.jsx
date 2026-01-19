// src/pages/employee/Pedidos/PedidosPage.jsx
import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import useAuthStore from '../../../store/authStore'
import menuService from '../../../services/menuService'

// Importamos los componentes refactorizados
import TableSelector from '../../../components/pedidos/TableSelector'
import MenuSection from '../../../components/pedidos/MenuSection'
import OrderSummary from '../../../components/pedidos/OrderSummary'

function PedidosPage() {
  const { role } = useAuthStore()
  
  // Estado Global de la Página
  const [selectedMesa, setSelectedMesa] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [carrito, setCarrito] = useState({}) 

  // Estado del Pedido (Cliente, etc)
  const [clienteInfo, setClienteInfo] = useState({ razonSocial: '', nit: '' })
  const [tipoPedido, setTipoPedido] = useState('mesa') 
  const [observaciones, setObservaciones] = useState('')

  // Carga de Datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
            menuService.getCategorias(),
            menuService.getProductos()
        ])
        
        const catsData = Array.isArray(catsRes) ? catsRes : (catsRes.data || [])
        setCategorias(catsData)
        if (catsData.length > 0) setSelectedCategoria(catsData[0].id)

        const prodsData = Array.isArray(prodsRes) ? prodsRes : (prodsRes.data || [])
        setProductos(prodsData)
      } catch (error) {
        console.error("Error al cargar datos", error)
      }
    }
    fetchData()
  }, [])

  // Funciones de Carrito
  const handleProductClick = (producto) => {
    setCarrito(prev => {
        if (prev[producto.id]) return prev;
        return { ...prev, [producto.id]: { ...producto, cantidad: 1 } }
    })
  }

  const updateCantidad = (e, productoId, delta) => {
    e?.stopPropagation() 
    setCarrito(prev => {
        const item = prev[productoId]
        if (!item) return prev
        const newCantidad = item.cantidad + delta
        if (newCantidad <= 0) {
            const { [productoId]: _, ...rest } = prev
            return rest
        }
        return { ...prev, [productoId]: { ...item, cantidad: newCantidad } }
    })
  }

  const removeItem = (e, productoId) => {
    e?.stopPropagation()
    setCarrito(prev => {
        const { [productoId]: _, ...rest } = prev
        return rest
    })
  }

  const totalPedido = useMemo(() => {
    return Object.values(carrito).reduce((acc, item) => acc + (Number(item.precio) * item.cantidad), 0)
  }, [carrito])

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4 overflow-hidden p-1"> 
      
      {/* 1. Encabezado */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-[var(--gris-primario)]">Pedidos</h1>
          <p className="text-[var(--gris-primario)] mt-1">Gestión de pedidos del restaurant</p>
        </div>
      </div>

      {/* 2. Selector de Mesas */}
      <TableSelector 
        selectedMesa={selectedMesa} 
        onSelectMesa={setSelectedMesa} 
      />
      
      {/* 3. Área Principal Dividida */}
      <div className='flex flex-col lg:flex-row gap-4 flex-1 min-h-0'>
        
        {/* Izquierda: Menú y Productos */}
        <MenuSection 
          categorias={categorias}
          productos={productos}
          carrito={carrito}
          onProductClick={handleProductClick}
          onUpdateQuantity={updateCantidad}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategoria={selectedCategoria}
          setSelectedCategoria={setSelectedCategoria}
        />

        {/* Derecha: Resumen de Pedido */}
        <OrderSummary 
          selectedMesa={selectedMesa}
          carrito={carrito}
          clienteInfo={clienteInfo}
          setClienteInfo={setClienteInfo}
          tipoPedido={tipoPedido}
          setTipoPedido={setTipoPedido}
          observaciones={observaciones}
          setObservaciones={setObservaciones}
          totalPedido={totalPedido}
          onUpdateQuantity={updateCantidad}
          onRemoveItem={removeItem}
        />
      </div>
    </div>
  )
}

export default PedidosPage