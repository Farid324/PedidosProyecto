// src/pages/PedidosPage.jsx
import { ShoppingCart, Plus } from 'lucide-react'
import useAuthStore from '../store/authStore'

function PedidosPage() {
  const { role } = useAuthStore()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Pedidos</h1>
          <p className="text-gray-600 mt-1">Gestión de pedidos del restaurant</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          Nuevo Pedido
        </button>
      </div>
      
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <ShoppingCart size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Sistema de pedidos en desarrollo</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PedidosPage