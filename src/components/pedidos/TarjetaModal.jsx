// src/components/pedidos/TarjetaModal.jsx
import { X, CreditCard } from 'lucide-react'

export default function TarjetaModal({ isOpen, onClose, onConfirm, totalPedido }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <CreditCard size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Pago con Tarjeta</h3>
                <p className="text-xs text-gray-500">Registrar pago con tarjeta de débito/crédito</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col items-center">
            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-4">
              <CreditCard size={48} className="text-purple-600" />
            </div>

            <p className="text-sm text-gray-600 text-center mb-4">
              ¿El cliente pagará con <strong>tarjeta</strong>? Esto registrará el método de pago como tarjeta para este pedido.
            </p>

            {/* Total */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Total a pagar</p>
              <p className="text-3xl font-bold text-[var(--guindo-primario)]">Bs. {totalPedido.toFixed(2)}</p>
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
              className="flex-1 py-2.5 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold transition-colors shadow-sm"
            >
              Registrar Pago con Tarjeta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
