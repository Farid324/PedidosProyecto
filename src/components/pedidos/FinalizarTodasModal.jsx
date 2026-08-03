import { AlertCircle } from 'lucide-react'

export default function FinalizarTodasModal({ isOpen, onClose, onConfirm, isFinalizando }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={!isFinalizando ? onClose : undefined} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full">
          
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={28} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">¿Finalizar todas las mesas?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción marcará todas las mesas ocupadas como completadas y facturadas.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                disabled={isFinalizando}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                disabled={isFinalizando}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                {isFinalizando ? 'Finalizando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
