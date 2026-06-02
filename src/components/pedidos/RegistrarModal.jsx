// src/components/pedidos/RegistrarModal.jsx
import { X, ShoppingCart } from 'lucide-react'

export default function RegistrarModal({ isOpen, onClose, onConfirm, carrito, totalPedido, pedidoExistente }) {
  if (!isOpen) return null

  const items = Object.values(carrito)

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--guindo-primario)] rounded-full flex items-center justify-center">
                <ShoppingCart size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {pedidoExistente ? 'Actualizar Pedido' : 'Confirmar Pedido'}
                </h3>
                <p className="text-xs text-gray-500">Revisa los detalles antes de registrar</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Lista de items */}
          <div className="p-5 max-h-[40vh] overflow-y-auto space-y-2">
            {items.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No hay productos en la orden</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.nombre}</p>
                    <p className="text-xs text-gray-500">{item.cantidad} x Bs. {Number(item.precio).toFixed(2)}</p>
                  </div>
                  <span className="text-sm font-bold text-[var(--guindo-primario)] ml-3">
                    Bs. {(item.cantidad * Number(item.precio)).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Total */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-800">TOTAL</span>
              <span className="text-xl font-bold text-[var(--guindo-primario)]">Bs. {totalPedido.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={items.length === 0}
              className="flex-1 py-2.5 px-4 bg-[var(--guindo-primario)] text-white rounded-lg hover:opacity-90 font-bold transition-opacity shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pedidoExistente ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
