import { useState, useRef, useEffect } from 'react'
import { Check, User, Camera, X } from 'lucide-react'

import useAuthStore from '../../../store/authStore'
import usuarioService from '../../../services/usuarioService'

function PerfilPage() {
  const { user, updateUser } = useAuthStore()

  // Estados Perfil
  const [loadingInit, setLoadingInit] = useState(true)
  const [previewFoto, setPreviewFoto] = useState(user?.foto || null)
  const [loadingPerfil, setLoadingPerfil] = useState(false)
  const [savedPerfil, setSavedPerfil] = useState(false)
  const fotoInputRef = useRef(null)

  // Datos Perfil
  const [formData, setFormData] = useState({
    carnet: user?.carnet || '',
    edad: user?.edad || '',
    telefono: user?.telefono || ''
  })
  
  // Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })

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
  }

  const showToast = (message, type = 'success') => {
    if (type === 'success') playSuccessSound();
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  }

  useEffect(() => {
    // Simular carga de datos para mostrar el esqueleto (shimmer)
    const timer = setTimeout(() => setLoadingInit(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleChangePerfil = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setSavedPerfil(false)
  }

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona una imagen válida', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 200
        const MAX_HEIGHT = 200
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setPreviewFoto(dataUrl)
        setSavedPerfil(false)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveFoto = () => {
    if (!confirm('¿Eliminar tu foto de perfil actual?')) return
    setPreviewFoto(null)
    setSavedPerfil(false)
  }

  const handleSavePerfil = async () => {
    setLoadingPerfil(true)
    try {
      const updatedData = {
        carnet: formData.carnet,
        edad: formData.edad ? parseInt(formData.edad) : null,
        telefono: formData.telefono,
        foto: previewFoto
      }
      const res = await usuarioService.updateUsuario(user.id, updatedData)
      if (res.success) {
        updateUser(res.data)
        setSavedPerfil(true)
        showToast('Perfil guardado exitosamente', 'success')
        setTimeout(() => setSavedPerfil(false), 3000)
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      showToast(error.response?.data?.message || 'Error al actualizar el perfil', 'error')
      
      // Resetear si hay error de validación por fechas
      setFormData({
        carnet: user?.carnet || '',
        edad: user?.edad || '',
        telefono: user?.telefono || ''
      })
    } finally {
      setLoadingPerfil(false)
    }
  }

  if (loadingInit) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-24 bg-gray-200 rounded-xl"></div>
        <div className="h-[400px] bg-gray-200 rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="card bg-[var(--blanco-primario)] rounded-xl p-6 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-1">
          <User className="text-[var(--guindo-primario)]" />
          Mi Perfil
        </h1>
        <p className="text-sm text-[var(--gris-primario)]">
          Administra tu información personal y foto de perfil
        </p>
      </div>

      <div className="card bg-[var(--blanco-primario)] rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[var(--guindo-primario)] flex items-center gap-2">
            <User size={20} />
            Datos Personales
          </h2>
          <p className="text-sm text-[var(--gris-primario)] mt-1">
            Mantén tu información actualizada
          </p>
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-6">
          <div className="flex gap-6 items-center">
            {/* Foto de Perfil */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-md bg-gray-100 flex items-center justify-center">
                {previewFoto ? (
                  <img src={previewFoto} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-gray-300" />
                )}
              </div>
              <button
                onClick={() => fotoInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[var(--guindo-primario)] text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
                title="Cambiar foto"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fotoInputRef}
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="hidden"
              />
            </div>

            {/* Botón de eliminar foto (solo si hay foto) */}
            {previewFoto && (
              <button
                onClick={handleRemoveFoto}
                className="text-sm text-red-500 hover:text-red-700 underline"
              >
                Quitar foto
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre (Solo lectura)</label>
              <input type="text" value={user?.nombre || ''} readOnly className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Correo (Solo lectura)</label>
              <input type="text" value={user?.email || ''} readOnly className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Rol (Solo lectura)</label>
              <input type="text" value={user?.rol === 'admin' ? 'Administrador' : 'Cajero'} readOnly className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Estado (Solo lectura)</label>
              <input type="text" value={user?.activo ? 'Activo' : 'Inactivo'} readOnly className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-green-600 font-medium outline-none" />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Carnet</label>
              <input 
                type="text" 
                name="carnet"
                value={formData.carnet} 
                onChange={handleChangePerfil}
                disabled={!!user?.carnet}
                className={`w-full p-2 bg-white border border-gray-300 rounded-lg text-sm outline-none ${user?.carnet ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:border-[var(--guindo-primario)] focus:ring-1 focus:ring-[var(--guindo-primario)]'}`} 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono (Opcional)</label>
              <input 
                type="text" 
                name="telefono"
                value={formData.telefono} 
                onChange={handleChangePerfil}
                className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[var(--guindo-primario)] focus:ring-1 focus:ring-[var(--guindo-primario)] outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Edad (Opcional)</label>
              <input 
                type="number" 
                name="edad"
                value={formData.edad} 
                onChange={handleChangePerfil}
                className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[var(--guindo-primario)] focus:ring-1 focus:ring-[var(--guindo-primario)] outline-none" 
              />
            </div>
          </div>

          <div className="mt-auto pt-4 flex justify-end">
            <button
              onClick={handleSavePerfil}
              disabled={loadingPerfil}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--guindo-primario)] text-white rounded-lg hover:opacity-90 font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loadingPerfil ? (
                <>Guardando...</>
              ) : savedPerfil ? (
                <><Check size={18} /> Guardado</>
              ) : (
                <>Guardar Perfil</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
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
  )
}

export default PerfilPage
