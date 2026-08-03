import { X, Receipt, Clock, User, CheckCircle, CreditCard } from 'lucide-react'

export default function DetallePedidoModal({ isOpen, onClose, pedido }) {
  if (!isOpen || !pedido) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-[var(--blancoFondo-primario)] shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${pedido.estado === 'completado' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
              <Receipt size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--gris-primario)]">Detalle del Pedido</h2>
              <p className="text-sm text-gray-500 font-medium">
                Mesa {pedido.mesa || '--'} • ID: {pedido.numero_diario || pedido.id}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-[var(--guindo-primario)] transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start gap-3">
              <User size={18} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-0.5">Cliente</p>
                <p className="text-sm font-semibold text-gray-800">{pedido.razon_social || 'Sin nombre'}</p>
                <p className="text-xs text-gray-500">NIT: {pedido.nit || '00000'}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start gap-3">
              <Clock size={18} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-0.5">Fecha y Hora</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(pedido.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(pedido.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start gap-3">
              <CheckCircle size={18} className={pedido.estado === 'completado' ? 'text-green-500 mt-0.5 shrink-0' : 'text-orange-500 mt-0.5 shrink-0'} />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-0.5">Estado</p>
                <p className={`text-sm font-bold uppercase ${pedido.estado === 'completado' ? 'text-green-600' : 'text-orange-600'}`}>
                  {pedido.estado === 'pendiente' ? 'Registrado' : pedido.estado === 'completado' ? 'Finalizado' : pedido.estado}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start gap-3">
              <CreditCard size={18} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-0.5">Método</p>
                <p className="text-sm font-semibold text-gray-800">
                  {pedido.metodo_pago || (pedido.pago_qr ? 'QR' : 'Efectivo/Pendiente')}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3 uppercase tracking-wider text-sm border-b pb-2">Productos</h3>
            <div className="space-y-3">
              {pedido.DetallePedidos?.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[var(--azul-secundario)] text-[var(--azul-primario)] font-bold flex items-center justify-center text-sm">
                      {item.cantidad}x
                    </span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {item.Producto?.nombre || 'Producto Desconocido'}
                    </span>
                  </div>
                  <span className="font-bold text-gray-700 text-sm">
                    Bs. {(Number(item.precio_unitario) * item.cantidad).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {pedido.observaciones && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-xs text-yellow-800 uppercase font-bold mb-1">Observaciones</p>
              <p className="text-sm text-yellow-900">{pedido.observaciones}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
          <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">Total Pedido</span>
          <span className="text-2xl font-bold text-[var(--azul-primario)]">
            Bs. {Number(pedido.total).toFixed(2)}
          </span>
        </div>
        
      </div>
    </div>
  )
}
