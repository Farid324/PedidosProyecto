// src/pages/Admin/Gestion/GestionMenuPage.jsx

import { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Tag, Search, Edit3, Trash2, Check, X } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import menuService from '../../../services/menuService';
import CategoryModal from '../../../components/menu/CategoryModal';
import ProductModal from '../../../components/menu/ProductModal';
import Modal from '../../../components/common/Modal';

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

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDeleting: false });

  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playNote = (frequency, startTime, duration) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + startTime);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start(audioCtx.currentTime + startTime);
        oscillator.stop(audioCtx.currentTime + startTime + duration);
      };
      playNote(523.25, 0, 0.15); // C5
      playNote(659.25, 0.1, 0.3); // E5
    } catch (e) {
      console.error('Audio playback failed', e);
    }
  };

  const showToast = (message, type = 'success') => {
    if (type === 'success') playSuccessSound();
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  const fetchAll = async (showLoading = true) => {
    if (showLoading) setLoading(true);
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
      if (showLoading) setLoading(false);
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
        showToast('Categoría actualizada correctamente', 'success');
      } else {
        await menuService.createCategoria(data);
        showToast('Categoría creada correctamente', 'success');
      }
      setCatOpen(false);
      setEditingCategory(null);
      await fetchAll(false);
    } catch (e) {
      console.error(e);
      showToast(e?.response?.data?.error || 'Error guardando categoría', 'error');
    }
  };

  const removeCategoria = (cat) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Categoría',
      message: `¿Estás seguro de que deseas eliminar la categoría "${cat.nombre}"?`,
      isDeleting: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isDeleting: true }));
        try {
          await menuService.deleteCategoria(cat.id);
          await fetchAll(false);
          showToast('Categoría eliminada correctamente', 'success');
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, isDeleting: false });
        } catch (e) {
          showToast(e?.response?.data?.error || 'No se pudo eliminar (puede tener productos asociados)', 'error');
          setConfirmDialog(prev => ({ ...prev, isDeleting: false }));
        }
      }
    });
  };

  const openNewProducto = () => { setEditingProduct(null); setProdOpen(true); };
  const openEditProducto = (p) => { setEditingProduct(p); setProdOpen(true); };
  
  const saveProducto = async (payload) => {
    console.log("Enviando al backend:", payload);
    try {
      if (editingProduct) {
        await menuService.updateProducto(editingProduct.id, payload);
        showToast('Platillo actualizado correctamente', 'success');
      } else {
        await menuService.createProducto(payload);
        showToast('Platillo creado correctamente', 'success');
      }
      setProdOpen(false);
      setEditingProduct(null);
      await fetchAll(false);
    } catch (e) {
      console.error(e);
      showToast(e?.response?.data?.error || 'Error guardando producto', 'error');
    }
  };

  const removeProducto = (p) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Platillo',
      message: `¿Estás seguro de que deseas eliminar el platillo "${p.nombre}"?`,
      isDeleting: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isDeleting: true }));
        try {
          await menuService.deleteProducto(p.id);
          await fetchAll(false);
          showToast('Platillo eliminado correctamente', 'success');
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, isDeleting: false });
        } catch (e) {
          showToast('No se pudo eliminar el producto', 'error');
          setConfirmDialog(prev => ({ ...prev, isDeleting: false }));
        }
      }
    });
  };

  const toggleDisponible = async (p) => {
    try {
      await menuService.setDisponibilidad(p.id, !p.disponible);
      await fetchAll(false);
      showToast(p.disponible ? 'Platillo ocultado' : 'Platillo ahora visible', 'success');
    } catch (e) {
      showToast('No se pudo cambiar el estado', 'error');
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
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-gray-50/50">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="w-12 h-12 bg-gray-200 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="flex justify-end gap-2"><div className="w-8 h-8 bg-gray-200 rounded-lg"></div><div className="w-8 h-8 bg-gray-200 rounded-lg"></div></div></td>
                  </tr>
                ))
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
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${p.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.disponible && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                        {!p.disponible && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
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

      <Modal
        isOpen={confirmDialog.isOpen}
        onClose={() => !confirmDialog.isDeleting && setConfirmDialog({ ...confirmDialog, isOpen: false })}
        title={confirmDialog.title}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">{confirmDialog.message}</p>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
              disabled={confirmDialog.isDeleting}
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDialog.onConfirm}
              disabled={confirmDialog.isDeleting}
              className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {confirmDialog.isDeleting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Eliminando...
                </>
              ) : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Facherísimo */}
      {toast.visible && (
        <div className={`fixed bottom-8 right-8 z-[9999] flex items-center gap-3 px-6 py-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 backdrop-blur-md transform transition-all duration-300 animate-bounce ${toast.type === 'success' ? 'bg-green-600/90 text-white' : 'bg-red-600/90 text-white'}`}>
          {toast.type === 'success' ? (
            <div className="bg-white/20 p-1.5 rounded-full">
              <Check size={20} className="text-white" />
            </div>
          ) : (
            <div className="bg-white/20 p-1.5 rounded-full">
              <X size={20} className="text-white" />
            </div>
          )}
          <p className="font-semibold text-sm">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

export default GestionMenuPage;