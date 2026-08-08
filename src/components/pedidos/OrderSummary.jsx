// src/components/pedidos/OrderSummary.jsx
import { ShoppingCart, Plus, Minus, Trash2, FileText, Printer, CheckCircle, Save, CreditCard, Wallet } from 'lucide-react'

export default function OrderSummary({
  selectedMesa,
  carrito,
  clienteInfo,
  setClienteInfo,
  tipoPedido,
  setTipoPedido,
  observaciones,
  setObservaciones,
  totalPedido,
  onUpdateQuantity,
  onRemoveItem,
  onRegistrar,
  onFinalizar,
  onComanda,
  onCuenta,
  onImprimir,
  onTarjeta,
  pagoQR,
  pagoTarjeta,
  pedidoActivo,
  validationError
}) {
  return (
    <div className='card bg-white rounded-xl w-auto lg:w-96 shrink-0 h-full flex flex-col shadow-lg border border-gray-100 overflow-hidden'>
      
      {/* 1. Header */}
      <div className="bg-white border-b border-gray-200 shrink-0">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-lg text-gray-800">Orden Actual</h2>
          <span className={`text-xs px-2 py-1 rounded font-bold ${pedidoActivo ? 'bg-orange-500 text-white' : 'bg-[var(--guindo-primario)] text-white'}`}>
            Mesa: {selectedMesa || '--'} {pedidoActivo ? '• Ocupada' : ''}
          </span>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Razón Social (Opcional)" 
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--guindo-primario)] ${validationError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              value={clienteInfo.razonSocial}
              onChange={(e) => setClienteInfo({...clienteInfo, razonSocial: e.target.value})}
            />
            {validationError && <p className="text-xs text-red-500 mt-0.5">Obligatorio</p>}
          </div>
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="NIT / CI (Opcional)" 
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--guindo-primario)]"
              value={clienteInfo.nit}
              onChange={(e) => setClienteInfo({...clienteInfo, nit: e.target.value})}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => setTipoPedido('mesa')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${tipoPedido === 'mesa' ? 'bg-[var(--guindo-primario)] text-white border-[var(--guindo-primario)]' : 'bg-white text-gray-600 border-gray-300'}`}
          >
            C. Interno
          </button>
          <button 
            onClick={() => setTipoPedido('llevar')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${tipoPedido === 'llevar' ? 'bg-[var(--guindo-primario)] text-white border-[var(--guindo-primario)]' : 'bg-white text-gray-600 border-gray-300'}`}
          >
            Para Llevar
          </button>
        </div>
      </div>

      {/* 2. Lista de Items */}
      <div className="flex-1 overflow-y-auto py-2 pr-2 space-y-2 bg-[var(--blanco-primario)] custom-scrollbar">
        {Object.keys(carrito).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--gris-primario)] opacity-60">
            <ShoppingCart size={30} className="mb-2"/>
            <p className="text-sm font-medium">Orden vacía</p>
          </div>
        ) : (
          Object.values(carrito).map((item) => (
            <div key={item.id} 
            className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg shadow-md hover:border-gray-300 transition-colors">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm font-bold text-[var(--gris-primario)] truncate">{item.nombre}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[var(--gris-primario)] bg-gray-100 px-1.5 py-0.5 rounded">{item.cantidad} x {item.precio}</span>
                  <span className="text-sm font-bold text-[var(--guindo-primario)]">
                    Bs. {(item.cantidad * item.precio).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={(e) => onUpdateQuantity(e, item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-[var(--azul-primario)] transition-colors">
                  <Minus size={14} />
                </button>
                <span className="text-sm font-bold w-6 text-center">{item.cantidad}</span>
                <button onClick={(e) => onUpdateQuantity(e, item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-[var(--azul-primario)] transition-colors">
                  <Plus size={14} />
                </button>
                <button onClick={(e) => onRemoveItem(e, item.id)} className="w-7 h-7 flex items-center justify-center rounded bg-red-50 hover:bg-red-100 text-red-500 ml-1 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Footer */}
      <div className="bg-white border-gray-200 space-y-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0 z-10">
        <textarea 
          placeholder="Observaciones (Nº viper, notas de cocina)..." 
          className="w-full pt-2 pr-2 pl-2 pb-6 text-xs bg-gray-50 border text-[var(--gris-primario)] border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--guindo-primario)] resize-none"
          rows="1" 
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />

        <div className="flex flex-col gap-2">
          <div className='flex gap-2'>
            <button 
              onClick={onRegistrar}
              className="flex flex-col items-center w-full justify-center p-1.5 bg-white text-[var(--color-boton-uno)] rounded-lg hover:bg-[var(--color-boton-uno)] border-2 border-[var(--color-boton-uno)] hover:text-white transition-colors"
            >
              <Save size={20} className="mb-0.5"/>
              <span className="text-xs font-bold uppercase">Registrar</span>
            </button>
            <button 
              onClick={onFinalizar}
              className="flex flex-col items-center w-full justify-center p-1.5 bg-white text-[var(--color-boton-dos)] rounded-lg hover:bg-[var(--color-boton-dos)] border-2 border-[var(--color-boton-dos)] hover:text-white transition-colors"
            >
              <CheckCircle size={20} className="mb-0.5"/>
              <span className="text-xs font-bold uppercase">Finalizar</span>
            </button>
          </div>
          <div className='flex gap-2'>
            <button 
              onClick={onComanda}
              className="flex flex-col items-center w-full justify-center p-1.5 bg-white text-[var(--color-boton-tres)] rounded-lg hover:bg-[var(--color-boton-tres)] border-2 border-[var(--color-boton-tres)] hover:text-white transition-colors"
            >
              <FileText size={20} className="mb-0.5"/>
              <span className="text-xs font-bold uppercase">Comanda</span>
            </button>
            <button 
              onClick={onCuenta}
              className={`flex flex-col items-center w-full justify-center p-1.5 rounded-lg border-2 transition-colors ${
                pagoQR 
                  ? 'bg-[var(--color-boton-cuatro)] text-white border-[var(--color-boton-cuatro)]' 
                  : 'bg-white text-[var(--color-boton-cuatro)] border-[var(--color-boton-cuatro)] hover:bg-[var(--color-boton-cuatro)] hover:text-white'
              }`}
            >
              <CreditCard size={20} className="mb-0.5"/>
              <span className="text-xs font-bold uppercase">Cuenta {pagoQR ? '(QR)' : ''}</span>
            </button>
          </div>
          
          {/* Botón Tarjeta + Imprimir */}
          <div className='flex gap-2'>
            <button 
              onClick={onTarjeta}
              className={`flex flex-col items-center w-full justify-center p-1.5 rounded-lg border-2 transition-colors ${
                pagoTarjeta 
                  ? 'bg-purple-600 text-white border-purple-600' 
                  : 'bg-white text-purple-600 border-purple-600 hover:bg-purple-600 hover:text-white'
              }`}
            >
              <Wallet size={20} className="mb-0.5"/>
              <span className="text-xs font-bold uppercase">Tarjeta {pagoTarjeta ? '✓' : ''}</span>
            </button>
            <button 
              onClick={onImprimir}
              className="flex flex-col items-center w-full justify-center p-1.5 bg-[var(--color-boton-cinco)] text-white rounded-lg hover:opacity-90 font-bold shadow-md transition-all"
            >
              <Printer size={20} className="mb-0.5"/>
              <span className="text-xs font-bold uppercase">Imprimir</span>
            </button>
          </div>

          {/* Total */}
          <div className="text-center py-1 text-sm font-bold text-[var(--gris-primario)]">
            Total: Bs. {totalPedido.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}