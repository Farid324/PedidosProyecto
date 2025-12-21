import { useEffect, useState, useMemo } from 'react';
import Modal from '../../components/common/Modal';
import TextInput from '../../components/common/inputs/TextInput';
import TextArea from '../../components/common/inputs/TextArea';
import Select from '../../components/common/inputs/Select';
import Checkbox from '../../components/common/inputs/Checkbox';

const EMPTY = {
  nombre: '', descripcion: '', precio: '', categoria_id: '', disponible: true, imagen_url: ''
};

function ProductModal({
  isOpen,
  onClose,
  onSave,                      // (data) => void
  initialValues = EMPTY,
  isEditing = false,
  categorias = [],
}) {
  const [form, setForm] = useState(initialValues);

  useEffect(() => {
    if (isOpen) setForm(initialValues);
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
    };
    onSave(payload);
  };

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
          label="Nombre"
          value={form.nombre}
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
          onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
          rows={3}
        />

        {/* Si quieres permitir URL de imagen */}
        <TextInput
          label="URL de imagen (opcional)"
          value={form.imagen_url}
          onChange={(e) => setForm((s) => ({ ...s, imagen_url: e.target.value }))}
          placeholder="https://..."
        />

        <Checkbox
          label="Disponible"
          checked={!!form.disponible}
          onChange={(e) => setForm((s) => ({ ...s, disponible: e.target.checked }))}
          className="md:col-span-2"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!categorias.length}
            className={`px-4 py-2 rounded-lg text-white ${
              categorias.length ? 'bg-[var(--guindo-primario)]' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isEditing ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductModal;
