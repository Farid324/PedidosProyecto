import { useEffect, useState } from 'react';
import { Edit3, Trash2, Tag } from 'lucide-react';
import Modal from '../../components/common/Modal';
import TextInput from '../../components/common/inputs/TextInput';
import TextArea from '../../components/common/inputs/TextArea';

function CategoryModal({
  isOpen,
  onClose,
  onSave,                 // (data) => void
  initialValues = { nombre: '', descripcion: '' },
  isEditing = false,
  categorias = [],        // para mostrar lista rápida
  onEditCategory,         // (cat) => void
  onDeleteCategory,       // (cat) => void
}) {
  const [form, setForm] = useState(initialValues);

  useEffect(() => {
    if (isOpen) setForm(initialValues || { nombre: '', descripcion: '' });
  }, [isOpen, initialValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar categoría' : 'Nueva categoría'}
      subtitle="Organiza los productos de tu menú"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextInput
          label="Nombre de la Categoría"
          value={form.nombre}
          placeholder="Ej: Bebidas, Postres..."
          onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
          required
          autoFocus
        />
        
        <TextArea
          label="Descripción (opcional)"
          value={form.descripcion}
          placeholder="Breve descripción para el menú..."
          onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
          rows={2}
        />

        {/* Sección de Lista de Categorías */}
        <div className="border-t border-gray-100 pt-4 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-[var(--guindo-primario)]" />
            <p className="text-sm font-bold text-gray-700">Categorías existentes</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 max-h-40 overflow-y-auto">
            {categorias.length === 0 ? (
              <p className="text-xs text-gray-400 text-center italic">
                Aún no hay categorías registradas.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categorias.map((c) => (
                  <div 
                    key={c.id} 
                    className={`inline-flex items-center gap-2 pl-3 pr-2 py-1.5 text-xs rounded-full border transition-colors ${
                      // Resaltar la categoría que se está editando actualmente
                      isEditing && form.nombre === c.nombre 
                        ? 'bg-blue-100 border-blue-300 text-blue-800' 
                        : 'bg-white border-gray-200 text-gray-700 hover:border-[var(--guindo-primario)]'
                    }`}
                  >
                    <span className="font-medium">{c.nombre}</span>
                    
                    <div className="flex items-center border-l border-gray-300 pl-2 ml-1 gap-1">
                      {onEditCategory && (
                        <button 
                          type="button" 
                          onClick={() => onEditCategory(c)} 
                          title="Editar"
                          className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                        >
                          <Edit3 size={12} />
                        </button>
                      )}
                      {onDeleteCategory && (
                        <button
                          type="button"
                          onClick={() => onDeleteCategory(c)}
                          title="Eliminar"
                          className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 rounded-lg bg-[var(--guindo-primario)] text-white hover:opacity-90 transition-opacity font-medium text-sm shadow-sm"
          >
            {isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CategoryModal;