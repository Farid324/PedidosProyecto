import { LogOut, X } from 'lucide-react'

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          
          <div className="flex flex-col items-center p-6 text-center">
            <div className="w-16 h-16 bg-[var(--blancoFondo-primario)] text-[var(--guindo-primario)] rounded-full flex items-center justify-center mb-4 border border-[var(--guindo-primario)]/20">
              <LogOut size={32} />
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">¿Cerrar Sesión?</h2>
            <p className="text-gray-600 text-sm mb-6">
              ¿Estás seguro de que deseas salir de tu cuenta? Tendrás que volver a iniciar sesión para acceder.
            </p>

            <div className="flex w-full gap-3 mt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 text-white bg-[var(--guindo-primario)] rounded-xl hover:opacity-90 font-semibold transition-opacity shadow-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
