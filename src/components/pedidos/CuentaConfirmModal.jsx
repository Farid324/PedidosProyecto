// src/components/pedidos/CuentaConfirmModal.jsx
import { X, AlertCircle } from 'lucide-react'

export default function CuentaConfirmModal({ isOpen, onClose, onConfirmSi, onConfirmNo }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-xs w-full">
          
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={28} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">¿Ya no pagará con QR?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Si confirmas, el método de pago cambiará a <strong>Efectivo</strong>.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={onConfirmNo}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                No, mantener QR
              </button>
              <button
                onClick={onConfirmSi}
                className="flex-1 py-2.5 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-bold transition-colors shadow-sm"
              >
                Sí, Efectivo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
