// src/pages/Admin/GestionMenuPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Tag, Search, Edit3, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import menuService from '../../../services/menuService';
import CategoryModal from '../../../components/menu/CategoryModal';
import ProductModal from '../../../components/menu/ProductModal';

function GestionMenuPage() {
  const { role } = useAuthStore();

  // Data
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI
  const [search, setSearch] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [prodOpen, setProdOpen] = useState(false);

  // Edición
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        menuService.getCategorias(),
        menuService.getProductos(search),
      ]);
      setCategorias(cats.data || []);
      setProductos(prods.data || []);
    } catch (e) {
      console.error(e);
      alert('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      (p.categoria?.nombre || '').toLowerCase().includes(q)
    );
  }, [productos, search]);

  // Categoría
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

  // Producto
  const openNewProducto = () => { setEditingProduct(null); setProdOpen(true); };
  const openEditProducto = (p) => { setEditingProduct(p); setProdOpen(true); };
  const saveProducto = async (payload) => {
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
      {/* Header */}
      <div className="flex flex-col bg-[var(--blanco-primario)] md:flex-row md:items-center md:justify-between gap-10 rounded-xl shadow-[0_0_3px_rgba(0,0,0,0.3)] p-6">
        <div className='flex flex-col gap-2 w-3/12'>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Menú</h1>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o categoría..."
              className="pl-9 w-full py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 "
            />
          </div>
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={openNewProducto}
            className="inline-flex items-center gap-2 bg-[var(--guindo-primario)] text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            <PlusCircle size={18} /> Agregar platillo
          </button>
          <button
            onClick={openNewCategoria}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Tag size={18} /> Agregar categoría
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="bg-[var(--blanco-primario)] shadow-[0_0_3px_rgba(0,0,0,0.3)] rounded-xl overflow-hidden">
        <div className="px-10 py-5 flex items-center justify-between">
          <div>
            <div className='flex gap-2'>
              <h2 className="text-lg font-semibold text-gray-800">Menú actual</h2>
              <h2 className="text-lg font-semibold text-gray-800">
                {loading ? 'Cargando...' : `${filtered.length} producto(s)`}
              </h2>
            </div>
            <span>
                Lista de todos los productos disponibles en el sistema
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className='px-10 py-2'>
            <table className="min-w-full text-sm">
              <thead className="bg-[var(--blanco-primario)]">
                <tr className="text-left text-gray-700">
                  <th className="px-5 py-5">Nombre</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Precio (Bs.)</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-5 py-3 font-medium text-gray-900">{p.nombre}</td>
                    <td className="px-5 py-3">{p.categoria?.nombre || '—'}</td>
                    <td className="px-5 py-3 text-green-500 font-semibold">Bs. {Number(p.precio || 0).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full
                        ${p.disponible ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                        {p.disponible ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {p.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => toggleDisponible(p)}
                          className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                          title={p.disponible ? 'Marcar No disponible' : 'Marcar Disponible'}
                        >
                          {p.disponible ? 'Ocultar' : 'Mostrar'}
                        </button>
                        <button
                          onClick={() => openEditProducto(p)}
                          className="p-2 rounded hover:bg-gray-100"
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => removeProducto(p)}
                          className="p-2 rounded hover:bg-red-50 text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && !loading && (
                  <tr>
                    <td className="px-5 py-6 text-center text-gray-500" colSpan={5}>
                      No hay productos que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

        {/* Modal Categoría */}
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

        {/* Modal Producto */}
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
              }
            : { nombre: '', descripcion: '', precio: '', categoria_id: '', disponible: true, imagen_url: '' }}
          isEditing={!!editingProduct}
          categorias={categorias}
        />
    </div>
  );
}

export default GestionMenuPage;
