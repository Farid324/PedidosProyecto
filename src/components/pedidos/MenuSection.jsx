// src/components/pedidos/MenuSection.jsx
import { ShoppingCart, Plus, Minus, Image as ImageOff } from 'lucide-react'
import TextInput from '../../components/common/inputs/TextInput'

export default function MenuSection({ 
  categorias, 
  productos, 
  carrito, 
  onProductClick, 
  onUpdateQuantity,
  searchTerm,
  setSearchTerm,
  selectedCategoria,
  setSelectedCategoria
}) {

  // Filtramos aquí para no saturar el componente padre
  const filteredProducts = productos.filter(p => {
    const matchesCategory = selectedCategoria ? p.categoria_id === selectedCategoria : true
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch && p.disponible
  })

  return (
    <div className="card bg-white p-4 rounded-xl flex-1 flex flex-col h-full shadow-sm border border-gray-100 min-h-0">
      <div className='flex gap-3 items-center mb-4 shrink-0'>
    <h2 className='text-xl font-bold text-gray-800'>Menú</h2>
        <div className="flex-1">
            <TextInput 
                placeholder="Buscar producto..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      
      {/* Categorías */}
      <div className="mb-4 shrink-0">
        {categorias.length === 0 ? (
            <p className="text-gray-400 text-sm">Cargando categorías...</p>
        ) : (
            <div className="flex gap-2 overflow-x-auto p-1 rounded-lg scrollbar-hide bg-[var(--blancoFondo-secundario)]">
                {categorias.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategoria(cat.id)}
                        className={`
                            flex-1 min-w-[100px] py-2 px-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap 
                            ${selectedCategoria === cat.id
                                ? 'bg-[var(--guindo-primario)] border-[var(--guindo-primario)] text-white shadow-md'
                                : '  text-[var(--gris-primario)]  hover:bg-gray-50'
                            }
                        `}
                    >
                        {cat.nombre}
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* Grid de Productos (Scrollable) */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {filteredProducts.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ShoppingCart size={48} className="mb-2 opacity-50" />
              <p>No hay productos disponibles</p>
           </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pb-2">
                {filteredProducts.map(product => {
                    const enCarrito = carrito[product.id];
                    return (
                        <div 
                            key={product.id}
                            onClick={() => onProductClick(product)}
                            className={`
                                group relative bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col
                                ${enCarrito ? 'shadow-md ring-opacity-50' : 'border-gray-200'}
                            `}
                        >
                            <div className="h-28 w-full bg-gray-100 relative overflow-hidden shrink-0 border-b-2">
                                {product.imagen_base64 ? (
                                    <img src={product.imagen_base64} alt={product.nombre} className="w-full h-full object-cover" />
                                ) : product.imagen_url ? (
                                    <img src={product.imagen_url} alt={product.nombre} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageOff size={24} />
                                    </div>
                                )}

                                {/* Overlay de Cantidad */}
                                {enCarrito && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10 animate-in fade-in duration-200">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={(e) => onUpdateQuantity(e, product.id, -1)}
                                                className="w-8 h-8 rounded-full bg-white text-[var(--guindo-primario)] flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform"
                                            >
                                                <Minus size={16} strokeWidth={3} />
                                            </button>
                                            <span className="text-white font-bold text-lg min-w-[20px] text-center">
                                                {enCarrito.cantidad}
                                            </span>
                                            <button 
                                                onClick={(e) => onUpdateQuantity(e, product.id, 1)}
                                                className="w-8 h-8 rounded-full bg-white text-[var(--guindo-primario)] flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform"
                                            >
                                                <Plus size={16} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col justify-between flex-1 bg-white">
                                <h3 className="p-2 font-semibold text-[var(--gris-primari)] text-xs sm:text-sm leading-tight mb-1 line-clamp-2">
                                    {product.nombre}
                                </h3>
                                <p className="p-2 text-[var(--blanco-primario)] font-bold text-sm bg-[var(--azul-primario)]">
                                    Bs. {Number(product.precio).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
      </div>
    </div>
  )
}