// src/components/usuarios/UsuarioModal.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function UsuarioModal({ isOpen, onClose, onSave, usuarioToEdit }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    carnet: '',
    edad: '',
    telefono: '',
    activo: true
  });

  const [error, setError] = useState('');

  // Reset form when modal opens or usuarioToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (usuarioToEdit) {
        setFormData({
          nombre: usuarioToEdit.nombre || '',
          email: usuarioToEdit.email || '',
          carnet: usuarioToEdit.carnet || '',
          edad: usuarioToEdit.edad || '',
          telefono: usuarioToEdit.telefono || '',
          activo: usuarioToEdit.activo !== undefined ? usuarioToEdit.activo : true
        });
      } else {
        setFormData({
          nombre: '',
          email: '',
          carnet: '',
          edad: '',
          telefono: '',
          activo: true
        });
      }
      setError('');
    }
  }, [isOpen, usuarioToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.carnet) {
      setError('Por favor, complete los campos obligatorios: Nombre, Correo y Carnet.');
      return;
    }
    
    // Prepare payload
    const payload = {
      nombre: formData.nombre,
      email: formData.email,
      carnet: formData.carnet,
      edad: formData.edad ? parseInt(formData.edad, 10) : undefined,
      telefono: formData.telefono || undefined,
      activo: formData.activo,
      rol: usuarioToEdit ? usuarioToEdit.rol : 'cajero'
    };

    onSave(payload, usuarioToEdit ? usuarioToEdit.id : null);
  };

  const isEditing = !!usuarioToEdit;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          
          {!isEditing && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs border border-blue-100">
              <strong>Nota:</strong> La contraseña para el nuevo usuario se establecerá automáticamente igual a su Carnet de Identidad.
            </div>
          )}

          <form id="usuario-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--guindo-primario)] focus:border-[var(--guindo-primario)] outline-none transition-all"
                placeholder="Ej. Juan Pérez"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--guindo-primario)] focus:border-[var(--guindo-primario)] outline-none transition-all"
                placeholder="Ej. juan@correo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carnet de Identidad <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={formData.carnet}
                onChange={(e) => setFormData({...formData, carnet: e.target.value})}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--guindo-primario)] focus:border-[var(--guindo-primario)] outline-none transition-all"
                placeholder="Ej. 1234567"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edad (Opcional)
                </label>
                <input 
                  type="number" 
                  value={formData.edad}
                  onChange={(e) => setFormData({...formData, edad: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--guindo-primario)] focus:border-[var(--guindo-primario)] outline-none transition-all"
                  placeholder="Ej. 30"
                  min="15"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono (Opcional)
                </label>
                <input 
                  type="text" 
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--guindo-primario)] focus:border-[var(--guindo-primario)] outline-none transition-all"
                  placeholder="Ej. 77712345"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center mt-4">
                <input
                  id="activo"
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-[var(--guindo-primario)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--guindo-primario)]"
                />
                <label htmlFor="activo" className="ml-2 text-sm font-medium text-gray-700">
                  Usuario Activo
                </label>
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="usuario-form"
            className="px-4 py-2 bg-[var(--guindo-primario)] text-white rounded-lg hover:opacity-90 font-medium transition-opacity shadow-sm"
          >
            {isEditing ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

export default UsuarioModal;
