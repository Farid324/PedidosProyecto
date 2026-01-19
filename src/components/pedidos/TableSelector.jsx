// src/components/pedidos/TableSelector.jsx
import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function TableSelector({ selectedMesa, onSelectMesa }) {
  // Generamos un array de 20 mesas
  const mesas = Array.from({ length: 20 }, (_, i) => ({
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

  return (
    <div className='card bg-white p-4 rounded-xl shrink-0 shadow-sm border border-gray-100'>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-[var(--gris-primario)]">Seleccionar Mesa</h2>
        {selectedMesa && (
          <span className="text-sm font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
            Mesa {selectedMesa} Activa
          </span>
        )}
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
              className={`
                min-w-[200px] h-20 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 transform
                ${selectedMesa === mesa.id 
                  ? 'bg-[var(--guindo-primario)] border-[var(--guindo-primario)] text-white shadow-md scale-105' 
                  : 'bg-white border-gray-200 text-gray-500 hover:border-[var(--guindo-primario)] hover:text-[var(--guindo-primario)]'
                }
              `}
            >
              <span className="text-xs uppercase font-bold tracking-wider">Mesa</span>
              <span className="text-lg font-bold">{mesa.id}</span>
            </div>
          ))}
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