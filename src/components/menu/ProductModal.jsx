// src/components/menu/ProductModal.jsx
import { useEffect, useState, useMemo, useRef } from 'react';
import { Upload, X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import Modal from '../../components/common/Modal';
import TextInput from '../../components/common/inputs/TextInput';
import TextArea from '../../components/common/inputs/TextArea';
import Select from '../../components/common/inputs/Select';
import Checkbox from '../../components/common/inputs/Checkbox';

const EMPTY = {
  nombre: '', 
  descripcion: '', 
  precio: '', 
  categoria_id: '', 
  disponible: true, 
  imagen_url: '',    // Para links externos
  imagen_base64: ''  // Para archivos subidos
};

function ProductModal({
  isOpen,
  onClose,
  onSave,
  initialValues = EMPTY,
  isEditing = false,
  categorias = [],
}) {
  const [form, setForm] = useState(initialValues);
  
  // Estado para controlar qué pestaña está activa: 'upload' o 'url'
  const [imageMode, setImageMode] = useState('upload'); 
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm(initialValues);
      
      // Determinar qué modo mostrar al abrir
      // Si tiene base64, mostramos upload. Si tiene url, mostramos url.
      if (initialValues.imagen_base64) {
        setImageMode('upload');
      } else if (initialValues.imagen_url) {
        setImageMode('url');
      } else {
        setImageMode('upload'); // Default
      }
    }
  }, [isOpen, initialValues]);

  const catOptions = useMemo(
    () => categorias.map((c) => ({ value: c.id, label: c.nombre })), [categorias]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categorias.length) return;
    
    const payload = {
      ...form,
      precio: Number(form.precio || 0),
      categoria_id: Number(form.categoria_id),
      // Limpiamos el campo que no se esté usando para no confundir a la BD
      imagen_url: imageMode === 'url' ? form.imagen_url : null,
      imagen_base64: imageMode === 'upload' ? form.imagen_base64 : null
    };
    
    onSave(payload);
  };

  // --- Manejo de Archivos (Base64) ---
  const handleFileSelect = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      // Guardamos en imagen_base64
      setForm(prev => ({ 
        ...prev, 
        imagen_base64: reader.result,
        imagen_url: '' // Limpiamos la URL si suben archivo
      }));
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, imagen_base64: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Determinar qué imagen mostrar en el preview (prioridad al base64 si estamos en modo upload)
  const previewImage = imageMode === 'upload' ? form.imagen_base64 : form.imagen_url;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar platillo' : 'Nuevo platillo'}
      subtitle="Completa los campos para guardar"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!categorias.length && (
          <div className="p-3 rounded-lg bg-yellow-50 text-yellow-800 text-sm">
            Debes crear al menos una <b>categoría</b> antes de guardar un platillo.
          </div>
        )}

        <TextInput
          label="Nombre del Platillo"
          value={form.nombre}
          placeholder="Ej: Hamburguesa Doble"
          onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextInput
            label="Precio (Bs.)"
            type="number"
            step="0.01"
            min="0"
            value={form.precio}
            placeholder="0.00"
            onChange={(e) => setForm((s) => ({ ...s, precio: e.target.value }))}
            required
          />
          <Select
            label="Categoría"
            value={form.categoria_id}
            onChange={(e) => setForm((s) => ({ ...s, categoria_id: e.target.value }))}
            options={catOptions}
            required
            disabled={!categorias.length}
          />
        </div>

        <TextArea
          label="Descripción"
          value={form.descripcion}
          placeholder="Ingredientes y detalles..."
          onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
          rows={2}
        />

        {/* --- SECCIÓN DE IMAGEN --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Platillo</label>
          
          {/* Tabs para cambiar modo */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-3">
            <button
              type="button"
              onClick={() => setImageMode('upload')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${
                imageMode === 'upload' 
                  ? 'bg-white text-[var(--guindo-primario)] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload size={16} /> Subir Archivo
            </button>
            <button
              type="button"
              onClick={() => setImageMode('url')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${
                imageMode === 'url' 
                  ? 'bg-white text-[var(--guindo-primario)] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LinkIcon size={16} /> Enlace URL
            </button>
          </div>

          {/* MODO: SUBIR ARCHIVO */}
          {imageMode === 'upload' && (
            <>
              {!form.imagen_base64 ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isDragging ? 'border-[var(--guindo-primario)] bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-[var(--guindo-primario)]' : 'text-gray-400'}`} />
                  <p className="text-sm text-gray-500 text-center">
                    <span className="font-semibold text-[var(--guindo-primario)]">Haz clic</span> o arrastra aquí
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Máx 5MB</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                </div>
              ) : (
                <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 group">
                  <img 
                    src={form.imagen_base64} 
                    alt="Preview" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-white text-red-600 px-3 py-1.5 rounded-full text-sm font-medium shadow-lg hover:bg-gray-100"
                      >
                        Cambiar Imagen
                      </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* MODO: URL */}
          {imageMode === 'url' && (
            <div className="space-y-3">
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-[var(--guindo-primario)] focus:border-[var(--guindo-primario)] sm:text-sm"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={form.imagen_url}
                    onChange={(e) => setForm(s => ({ ...s, imagen_url: e.target.value, imagen_base64: '' }))}
                  />
              </div>
              
              {/* Preview de la URL si existe */}
              {form.imagen_url && (
                <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 h-40 flex items-center justify-center">
                  <img 
                    src={form.imagen_url} 
                    alt="Preview URL" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://placehold.co/400x300?text=Error+URL"; }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <Checkbox
          label="Disponible para venta"
          checked={!!form.disponible}
          onChange={(e) => setForm((s) => ({ ...s, disponible: e.target.checked }))}
          className="md:col-span-2"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!categorias.length}
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              categorias.length 
                ? 'bg-[var(--guindo-primario)] hover:opacity-90' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Platillo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductModal;