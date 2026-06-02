// src/components/pedidos/CuentaModal.jsx
import { X, QrCode } from 'lucide-react'

export default function CuentaModal({ isOpen, onClose, onConfirm, totalPedido, qrImage }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <QrCode size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Pago con QR</h3>
                <p className="text-xs text-gray-500">Escanea el código para pagar</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* QR Image */}
          <div className="p-6 flex flex-col items-center">
            {qrImage ? (
              <div className="w-64 h-64 rounded-xl overflow-hidden border-4 border-gray-100 shadow-inner bg-white mb-4">
                <img src={qrImage} alt="QR de Pago" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-64 h-64 rounded-xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center mb-4 bg-gray-50">
                <QrCode size={48} className="text-gray-300 mb-2" />
                <p className="text-sm text-gray-400 text-center px-4">
                  No se ha configurado el QR de pago. El administrador debe subirlo desde Configuración.
                </p>
              </div>
            )}

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
              className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors shadow-sm"
            >
              Registrar Pago QR
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
