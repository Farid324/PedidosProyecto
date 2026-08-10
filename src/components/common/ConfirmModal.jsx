import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  type = 'warning', // warning, danger, info, success
  isAlert = false // If true, only shows the confirm button
}) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'danger': return <AlertTriangle size={32} />
      case 'success': return <CheckCircle size={32} />
      case 'info': return <Info size={32} />
      case 'warning':
      default: return <AlertCircle size={32} />
    }
  }

  const getColorClass = () => {
    switch (type) {
      case 'danger': return 'text-red-600 bg-red-50 border-red-200'
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'warning':
      default: return 'text-[var(--guindo-primario)] bg-[var(--blancoFondo-primario)] border-[var(--guindo-primario)]/20'
    }
  }

  const getButtonClass = () => {
    switch (type) {
      case 'danger': return 'bg-red-600 text-white hover:bg-red-700'
      case 'success': return 'bg-green-600 text-white hover:bg-green-700'
      case 'info': return 'bg-blue-600 text-white hover:bg-blue-700'
      case 'warning':
      default: return 'bg-[var(--guindo-primario)] text-white hover:opacity-90'
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          
          <div className="flex flex-col items-center p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${getColorClass()}`}>
              {getIcon()}
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-600 text-sm mb-6">
              {message}
            </p>

            <div className="flex w-full gap-3 mt-2">
              {!isAlert && (
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 font-semibold transition-colors"
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={() => {
                  if (onConfirm) onConfirm()
                  if (isAlert) onClose()
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm ${getButtonClass()}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>,
    document.body
  )
}
