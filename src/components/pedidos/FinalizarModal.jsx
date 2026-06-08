import { AlertCircle } from 'lucide-react'

export default function FinalizarModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full">
          
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={28} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">¿Finalizar este pedido y liberar la mesa?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción marcará el pedido como completado, facturado y la mesa quedará disponible.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition-colors shadow-sm"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
