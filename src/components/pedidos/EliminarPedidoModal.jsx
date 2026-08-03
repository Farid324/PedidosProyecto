import { X, AlertTriangle } from 'lucide-react'

export default function EliminarPedidoModal({ isOpen, onClose, onConfirm, isDeleting }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-red-50">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle size={24} />
            <h2 className="text-xl font-bold">Eliminar Pedido</h2>
          </div>
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 text-lg mb-2">
            ¿Estás seguro de que deseas eliminar este pedido registrado?
          </p>
          <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
            Esta acción liberará la mesa inmediatamente y no se puede deshacer.
          </p>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-white bg-red-600 rounded-xl hover:bg-red-700 font-semibold transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isDeleting ? 'Eliminando...' : 'Sí, Eliminar Pedido'}
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
