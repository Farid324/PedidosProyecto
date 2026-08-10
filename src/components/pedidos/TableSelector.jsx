// src/components/pedidos/TableSelector.jsx
import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export default function TableSelector({ selectedMesa, onSelectMesa, mesasOcupadas = [] }) {
  const [extraTables, setExtraTables] = useState(0)

  const maxOccupied = mesasOcupadas.reduce((max, m) => {
    const id = typeof m === 'object' ? m.id : m;
    const num = Number(id);
    return !isNaN(num) && num > max ? num : max;
  }, 0);

  const totalTables = Math.max(20 + extraTables, maxOccupied);

  const mesas = Array.from({ length: totalTables }, (_, i) => ({
    id: i + 1,
    nombre: `Mesa ${i + 1}`
  }))

  const scrollRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = 300
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }
  const handleMouseLeave = () => setIsDragging(false)
  const handleMouseUp = () => setIsDragging(false)
  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollRef.current.scrollLeft = scrollLeft - walk
  }
  
  const handleClick = (id) => {
    if (!isDragging) onSelectMesa(id)
  }

  const getMesaState = (mesaId) => {
    if (selectedMesa === mesaId) return 'selected'
    
    const mesaObj = mesasOcupadas.find(m => 
      (typeof m === 'object' ? m.id === mesaId : m === mesaId)
    )

    if (mesaObj) {
      if (typeof mesaObj === 'object' && mesaObj.estado === 'pendiente') return 'pending'
      return 'occupied'
    }
    return 'free'
  }

  const getMesaClasses = (mesaId) => {
    const state = getMesaState(mesaId)
    const base = 'min-w-[200px] h-20 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 transform'
    
    switch (state) {
      case 'selected':
        return `${base} bg-[var(--guindo-primario)] border-[var(--guindo-primario)] text-white shadow-md scale-105`
      case 'occupied':
        return `${base} bg-orange-50 border-orange-400 text-orange-600 hover:border-orange-500 shadow-sm`
      case 'pending':
        return `${base} bg-red-50 border-red-500 text-red-600 hover:border-red-600 shadow-sm animate-pulse`
      default:
        return `${base} bg-white border-gray-200 text-gray-500 hover:border-[var(--guindo-primario)] hover:text-[var(--guindo-primario)]`
    }
  }

  return (
    <div className='card bg-white p-4 rounded-xl shrink-0 shadow-sm border border-gray-100'>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
        <h2 className="text-lg font-bold text-[var(--gris-primario)]">Seleccionar Mesa</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300"></span>
            <span className="text-xs text-gray-500">Libre</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-400"></span>
            <span className="text-xs text-gray-500">Ocupada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs text-gray-500">Pendiente &gt;20m</span>
          </div>
          {selectedMesa && (
            <span className="text-sm font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
              Mesa {selectedMesa} Activa
            </span>
          )}
        </div>
      </div>
      
      <div className="relative group">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full text-[var(--guindo-primario)] border border-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-50 hover:scale-110 disabled:opacity-0"
        >
          <ChevronLeft size={20} />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mesas.map((mesa) => (
            <div
              key={mesa.id}
              onClick={() => handleClick(mesa.id)}
              className={getMesaClasses(mesa.id)}
            >
              <span className="text-xs uppercase font-bold tracking-wider">Mesa</span>
              <span className="text-lg font-bold">{mesa.id}</span>
              {getMesaState(mesa.id) === 'occupied' && (
                <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Ocupada</span>
              )}
              {getMesaState(mesa.id) === 'pending' && (
                <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-red-600">Pendiente</span>
              )}
            </div>
          ))}
          <div
            onClick={() => { if (!isDragging) setExtraTables(prev => prev + 1) }}
            className="min-w-[200px] h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center transition-all duration-200 hover:border-[var(--guindo-primario)] hover:bg-gray-50 cursor-pointer text-gray-400 hover:text-[var(--guindo-primario)] shrink-0"
          >
            <Plus size={24} />
            <span className="text-xs uppercase font-bold tracking-wider mt-1">Agregar Mesa</span>
          </div>
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full text-[var(--guindo-primario)] border border-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-50 hover:scale-110"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}