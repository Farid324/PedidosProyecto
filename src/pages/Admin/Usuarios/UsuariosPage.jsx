// src/pages/Admin/Usuarios/UsuariosPage.jsx
import { useEffect, useState } from 'react';
import { PlusCircle, Search, Users, Edit, Trash2, Check, X } from 'lucide-react';
import usuarioService from '../../../services/usuarioService';
import UsuarioModal from '../../../components/usuarios/UsuarioModal';
import Modal from '../../../components/common/Modal';

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState(null);

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

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await usuarioService.getUsuarios();
      setUsuarios(res.data || []);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.nombre || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.carnet || '').toLowerCase().includes(q)
    );
  });

  const handleOpenModal = (usuario = null) => {
    setUsuarioToEdit(usuario);
    setModalOpen(true);
  };

  const handleSaveUsuario = async (data, id = null) => {
    try {
      if (id) {
        await usuarioService.updateUsuario(id, data);
        showToast('Usuario actualizado correctamente', 'success');
      } else {
        await usuarioService.createUsuario(data);
        showToast('Usuario creado correctamente', 'success');
      }
      setModalOpen(false);
      fetchUsuarios();
    } catch (error) {
      console.error(error);
      showToast(error?.response?.data?.message || 'Error al guardar el usuario', 'error');
    }
  };

  const handleDeleteUsuario = async (id, nombre) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de que deseas eliminar al usuario ${nombre}? Si el usuario tiene ventas, solo será desactivado.`,
      isDeleting: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isDeleting: true }));
        try {
          const res = await usuarioService.deleteUsuario(id);
          if (res.data && res.data.message) {
            showToast(res.data.message, 'success');
          } else {
            showToast('Usuario eliminado/desactivado correctamente', 'success');
          }
          fetchUsuarios();
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, isDeleting: false });
        } catch (error) {
          console.error('Error al desactivar usuario:', error);
          showToast(error?.response?.data?.message || 'Error al desactivar el usuario', 'error');
          setConfirmDialog(prev => ({ ...prev, isDeleting: false }));
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="card flex flex-col bg-[var(--blanco-primario)] md:flex-row md:items-center md:justify-between gap-10 rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-2 w-full md:w-5/12">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-[var(--guindo-primario)]" /> 
            Gestión de Usuarios
          </h1>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, correo o carnet..."
              className="pl-9 w-full py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--guindo-primario)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-[var(--guindo-primario)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          >
            <PlusCircle size={18} /> Agregar Usuario
          </button>
        </div>
      </div>

      <div className="flex flex-col card bg-[var(--blanco-primario)] rounded-xl overflow-hidden shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex gap-2 items-baseline">
              <h2 className="text-lg font-semibold text-[var(--guindo-primario)]">Usuarios Registrados</h2>
              <span className="text-sm font-medium text-[var(--gris-primario)]">
                {loading ? 'Cargando...' : `(${filteredUsuarios.length} usuarios)`}
              </span>
            </div>
            <p className="text-sm text-[var(--gris-primario)]">
              Lista de todos los usuarios con acceso al sistema
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="border-b border-[var(--grisClaro-primario)]">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Nombre Completo</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Correo Electrónico</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Carnet (C.I.)</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Rol</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Estado</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-gray-50/50">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2"><div className="w-8 h-8 bg-gray-200 rounded"></div><div className="w-8 h-8 bg-gray-200 rounded"></div></div></td>
                  </tr>
                ))
              ) : filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No se encontraron usuarios.</td>
                </tr>
              ) : (
                filteredUsuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {u.nombre}
                      {u.edad && <span className="text-xs text-gray-500 ml-2">({u.edad} años)</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{u.carnet || <span className="text-gray-400 italic">No asignado</span>}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${u.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.rol === 'admin' ? 'Administrador' : 'Cajero'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.activo && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                        {!u.activo && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.rol !== 'admin' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(u)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar usuario"
                          >
                            <Edit size={18} />
                          </button>
                          {u.activo && (
                            <button 
                              onClick={() => handleDeleteUsuario(u.id, u.nombre)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UsuarioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUsuario}
        onError={(msg) => showToast(msg, 'error')}
        usuarioToEdit={usuarioToEdit}
        usuarios={usuarios}
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

export default UsuariosPage;
