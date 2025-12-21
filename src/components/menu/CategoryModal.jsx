import { useEffect, useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
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
    if (isOpen) setForm(initialValues);
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
      subtitle="Completa los campos para guardar"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Nombre"
          value={form.nombre}
          onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
          required
        />
        <TextArea
          label="Descripción (opcional)"
          value={form.descripcion}
          onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
          rows={3}
        />

        {categorias.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-2">Categorías existentes</p>
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-2 px-2 py-1 text-xs bg-gray-100 rounded">
                  {c.nombre}
                  {onEditCategory && (
                    <button type="button" onClick={() => onEditCategory(c)} title="Editar">
                      <Edit3 size={14} />
                    </button>
                  )}
                  {onDeleteCategory && (
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(c)}
                      title="Eliminar"
                      className="text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-[var(--guindo-primario)] text-white">
            {isEditing ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CategoryModal;
