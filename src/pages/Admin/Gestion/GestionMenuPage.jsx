import { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Tag, Search, Edit3, Trash2 } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import menuService from '../../../services/menuService';
import CategoryModal from '../../../components/menu/CategoryModal';
import ProductModal from '../../../components/menu/ProductModal';

function GestionMenuPage() {
  const { role } = useAuthStore();

  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [prodOpen, setProdOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [catsRes, prodsRes] = await Promise.all([
        menuService.getCategorias(),
        menuService.getProductos(search),
      ]);

      const catsData = Array.isArray(catsRes) ? catsRes : (catsRes?.data || []);
      const prodsData = Array.isArray(prodsRes) ? prodsRes : (prodsRes?.data || []);

      setCategorias(catsData);
      setProductos(prodsData);
    } catch (e) {
      console.error(e);
      setProductos([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!Array.isArray(productos)) return [];
    
    const q = search.trim().toLowerCase();
    if (!q) return productos;
    
    return productos.filter(p =>
      (p.nombre?.toLowerCase() || '').includes(q) ||
      (p.categoria?.nombre?.toLowerCase() || '').includes(q)
    );
  }, [productos, search]);

  const openNewCategoria = () => { setEditingCategory(null); setCatOpen(true); };
  const openEditCategoria = (cat) => { setEditingCategory(cat); setCatOpen(true); };
  
  const saveCategoria = async (data) => {
    try {
      if (editingCategory) {
        await menuService.updateCategoria(editingCategory.id, data);
      } else {
        await menuService.createCategoria(data);
      }
      setCatOpen(false);
      setEditingCategory(null);
      await fetchAll();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || 'Error guardando categoría');
    }
  };

  const removeCategoria = async (cat) => {
    if (!confirm(`¿Eliminar categoría "${cat.nombre}"?`)) return;
    try {
      await menuService.deleteCategoria(cat.id);
      await fetchAll();
    } catch (e) {
      alert(e?.response?.data?.error || 'No se pudo eliminar (puede tener productos asociados)');
    }
  };

  const openNewProducto = () => { setEditingProduct(null); setProdOpen(true); };
  const openEditProducto = (p) => { setEditingProduct(p); setProdOpen(true); };
  
  const saveProducto = async (payload) => {
    console.log("Enviando al backend:", payload);
    try {
      if (editingProduct) {
        await menuService.updateProducto(editingProduct.id, payload);
      } else {
        await menuService.createProducto(payload);
      }
      setProdOpen(false);
      setEditingProduct(null);
      await fetchAll();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || 'Error guardando producto');
    }
  };

  const removeProducto = async (p) => {
    if (!confirm(`¿Eliminar producto "${p.nombre}"?`)) return;
    try {
      await menuService.deleteProducto(p.id);
      await fetchAll();
    } catch (e) {
      alert('No se pudo eliminar el producto');
    }
  };

  const toggleDisponible = async (p) => {
    try {
      await menuService.setDisponibilidad(p.id, !p.disponible);
      await fetchAll();
    } catch (e) {
      alert('No se pudo cambiar el estado');
    }
  };

  return (
    <div className="space-y-6">
      <div className="card flex flex-col bg-[var(--blanco-primario)] md:flex-row md:items-center md:justify-between gap-10 rounded-xl p-6 shadow-sm border border-gray-100">
        <div className='flex flex-col gap-2 w-full md:w-4/12'>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Menú</h1>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o categoría..."
              className="pl-9 w-full py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--guindo-primario)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openNewProducto}
            className="inline-flex items-center gap-2 bg-[var(--guindo-primario)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <PlusCircle size={18} /> Agregar platillo
          </button>
          <button
            onClick={openNewCategoria}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Tag size={18} /> Agregar categoría
          </button>
        </div>
      </div>

      <div className="flex flex-col card bg-[var(--blanco-primario)] rounded-xl overflow-hidden shadow-sm border border-gray-100 gap-4">
        <div className=" flex items-center justify-between">
          <div>
            <div className='flex gap-2 items-baseline'>
              <h2 className="text-lg font-semibold text-[var(--guindo-primario)]">Menú actual</h2>
              <span className="text-sm font-medium text-[var(--gris-primario)]">
                {loading ? 'Cargando...' : `(${filtered.length} productos)`}
              </span>
            </div>
            <p className="text-sm text-[var(--gris-primario)]">
                Lista de todos los productos disponibles en el sistema
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="border-b border-[var(--grisClaro-primario)]">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Nombre</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Categoría</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Precio (Bs.)</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Estado</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Imagen</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Cargando productos...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No se encontraron productos.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.nombre}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                        {p.categoria?.nombre || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">Bs. {Number(p.precio || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${p.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.disponible ? 'Activo' : 'No disponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
                        {p.imagen_base64 ? (
                          <img src={p.imagen_base64} alt={p.nombre} className="w-full h-full object-cover" />
                        ) : p.imagen_url ? (
                          <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                        ) : (
                          <span className="text-xs text-gray-400">Sin img</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => toggleDisponible(p)}
                          className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50"
                          title={p.disponible ? 'Ocultar' : 'Mostrar'}
                        >
                          {p.disponible ? 'Ocultar' : 'Mostrar'}
                        </button>
                        <button 
                          onClick={() => openEditProducto(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => removeProducto(p)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryModal
        isOpen={catOpen}
        onClose={() => { setCatOpen(false); setEditingCategory(null); }}
        onSave={saveCategoria}
        initialValues={editingCategory
          ? { nombre: editingCategory.nombre, descripcion: editingCategory.descripcion || '' }
          : { nombre: '', descripcion: '' }}
        isEditing={!!editingCategory}
        categorias={categorias} 
        onEditCategory={openEditCategoria}
        onDeleteCategory={removeCategoria}
      />

      <ProductModal
        isOpen={prodOpen}
        onClose={() => { setProdOpen(false); setEditingProduct(null); }}
        onSave={saveProducto}
        initialValues={editingProduct
          ? {
              nombre: editingProduct.nombre,
              descripcion: editingProduct.descripcion || '',
              precio: String(editingProduct.precio ?? ''),
              categoria_id: editingProduct.categoria_id || '',
              disponible: !!editingProduct.disponible,
              imagen_url: editingProduct.imagen_url || '',
              imagen_base64: editingProduct.imagen_base64 || ''
            }
          : { 
              nombre: '', 
              descripcion: '', 
              precio: '', 
              categoria_id: '', 
              disponible: true, 
              imagen_url: '', 
              imagen_base64: '' 
            }
        }
        isEditing={!!editingProduct}
        categorias={categorias}
      />
    </div>
  );
}

export default GestionMenuPage;