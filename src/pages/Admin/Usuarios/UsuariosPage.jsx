// src/pages/Admin/Usuarios/UsuariosPage.jsx
import { useEffect, useState } from 'react';
import { PlusCircle, Search, Users, Edit, Trash2 } from 'lucide-react';
import usuarioService from '../../../services/usuarioService';
import UsuarioModal from '../../../components/usuarios/UsuarioModal';

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState(null);

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
      } else {
        await usuarioService.createUsuario(data);
      }
      setModalOpen(false);
      fetchUsuarios();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || 'Error al guardar el usuario');
    }
  };

  const handleDeleteUsuario = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${nombre}? Si el usuario tiene ventas, solo será desactivado.`)) {
      return;
    }
    
    try {
      const res = await usuarioService.deleteUsuario(id);
      if (res.data && res.data.message) {
        alert(res.data.message);
      }
      fetchUsuarios();
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      alert(error?.response?.data?.message || 'Error al desactivar el usuario');
    }
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
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Cargando usuarios...</td>
                </tr>
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
        usuarioToEdit={usuarioToEdit}
      />
    </div>
  );
}

export default UsuariosPage;
