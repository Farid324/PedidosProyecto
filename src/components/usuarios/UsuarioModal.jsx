// src/components/usuarios/UsuarioModal.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function UsuarioModal({ isOpen, onClose, onSave, onError, usuarioToEdit, usuarios = [] }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    carnet: '',
    edad: '',
    telefono: '',
    activo: true
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }
  }, [isOpen, usuarioToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.nombre) errors.nombre = 'Este campo es obligatorio';
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre.trim())) {
      errors.nombre = 'Solo letras y espacios (no números)';
    }

    if (!formData.email) errors.email = 'Este campo es obligatorio';
    else if (!/^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo)\.com$/i.test(formData.email.trim())) {
      errors.email = 'Correo inválido (ej: correo@gmail.com)';
    }

    if (!formData.carnet) errors.carnet = 'Este campo es obligatorio';
    else if (!/^\d+$/.test(formData.carnet.trim())) {
      errors.carnet = 'Solo números permitidos';
    }

    // Validaciones de unicidad (No permitir registrar el mismo nombre, email o carnet)
    const isDuplicateNombre = usuarios.some(u => 
      u.nombre.trim().toLowerCase() === formData.nombre.trim().toLowerCase() && u.id !== usuarioToEdit?.id
    );
    if (isDuplicateNombre) {
      errors.nombre = 'Este nombre ya está en uso por otro usuario';
    }

    const isDuplicateEmail = usuarios.some(u => 
      u.email.trim().toLowerCase() === formData.email.trim().toLowerCase() && u.id !== usuarioToEdit?.id
    );
    if (isDuplicateEmail) {
      errors.email = 'Este correo electrónico ya está registrado';
    }

    const isDuplicateCarnet = usuarios.some(u => 
      u.carnet === formData.carnet.trim() && u.id !== usuarioToEdit?.id
    );
    if (isDuplicateCarnet) {
      errors.carnet = 'Este carnet ya está registrado por otra persona';
    }

    if (formData.telefono && !/^\d+$/.test(formData.telefono.trim())) {
      errors.telefono = 'Solo números permitidos';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    setFieldErrors({});
    setIsSubmitting(true);
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

    try {
      await onSave(payload, usuarioToEdit ? usuarioToEdit.id : null);
    } finally {
      setIsSubmitting(false);
    }
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
                className={`w-full p-2.5 border rounded-lg outline-none transition-all ${fieldErrors.nombre ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-[var(--guindo-primario)] focus:border-[var(--guindo-primario)]'}`}
                placeholder="Ej. Juan Pérez"
              />
              {fieldErrors.nombre && <p className="text-xs text-red-500 mt-1">{fieldErrors.nombre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full p-2.5 border rounded-lg outline-none transition-all ${fieldErrors.email ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-[var(--guindo-primario)] focus:border-[var(--guindo-primario)]'}`}
                placeholder="Ej. juan@correo.com"
              />
              {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carnet de Identidad <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={formData.carnet}
                onChange={(e) => setFormData({...formData, carnet: e.target.value})}
                className={`w-full p-2.5 border rounded-lg outline-none transition-all ${fieldErrors.carnet ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-[var(--guindo-primario)] focus:border-[var(--guindo-primario)]'}`}
                placeholder="Ej. 1234567"
              />
              {fieldErrors.carnet && <p className="text-xs text-red-500 mt-1">{fieldErrors.carnet}</p>}
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
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${fieldErrors.telefono ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-[var(--guindo-primario)] focus:border-[var(--guindo-primario)]'}`}
                  placeholder="Ej. 77712345"
                />
                {fieldErrors.telefono && <p className="text-xs text-red-500 mt-1">{fieldErrors.telefono}</p>}
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
            disabled={isSubmitting}
            className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed opacity-70' : 'bg-[var(--guindo-primario)] hover:opacity-90 shadow-sm'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              isEditing ? 'Actualizar' : 'Guardar'
            )}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

export default UsuarioModal;
