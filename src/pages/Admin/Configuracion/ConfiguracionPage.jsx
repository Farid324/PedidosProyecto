// src/pages/Admin/Configuracion/ConfiguracionPage.jsx
import { useState, useEffect, useRef } from 'react'
import { Upload, QrCode, Check, Trash2, Image as ImageIcon, User, Camera, Eye, EyeOff, Lock, X, Clock } from 'lucide-react'
import configuracionService from '../../../services/configuracionService'

import useAuthStore from '../../../store/authStore'
import usuarioService from '../../../services/usuarioService'

function ConfiguracionPage() {
  const { user } = useAuthStore()

  // Estados generales
  const [loadingInit, setLoadingInit] = useState(true)

  // Estados Turnos
  const [turnos, setTurnos] = useState({
    turno_manana_ingreso: '',
    turno_manana_salida: '',
    turno_tarde_ingreso: '',
    turno_tarde_salida: ''
  })
  const [loadingTurnos, setLoadingTurnos] = useState(false)
  const [savedTurnos, setSavedTurnos] = useState(false)

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

  // Estados QR
  const [qrImage, setQrImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [loadingQr, setLoadingQr] = useState(false)
  const [savedQr, setSavedQr] = useState(false)
  const fileInputRef = useRef(null)

  // Password State
  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loadingPwd, setLoadingPwd] = useState(false)
  const [pwdMessage, setPwdMessage] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const resQr = await configuracionService.getQR()
      if (resQr.data && resQr.data.valor) {
        setQrImage(resQr.data.valor)
        setPreviewImage(resQr.data.valor)
      }

      if (user?.rol === 'admin') {
        const keys = ['turno_manana_ingreso', 'turno_manana_salida', 'turno_tarde_ingreso', 'turno_tarde_salida']
        const results = {}
        for (const k of keys) {
          const res = await configuracionService.getConfig(k)
          results[k] = res.data ? res.data.valor : ''
        }
        setTurnos(results)
      }
    } catch (error) {
      console.error('Error cargando data:', error)
    } finally {
      setTimeout(() => setLoadingInit(false), 500)
    }
  }

  const handleSaveTurnos = async () => {
    setLoadingTurnos(true)
    try {
      const keys = Object.keys(turnos)
      for (const k of keys) {
        if (turnos[k] !== undefined) {
          await configuracionService.saveConfig(k, turnos[k])
        }
      }
      setSavedTurnos(true)
      showToast('Horarios de turno guardados exitosamente', 'success')
      setTimeout(() => setSavedTurnos(false), 3000)
    } catch (error) {
      console.error(error)
      showToast('Error al guardar los horarios de turno', 'error')
    } finally {
      setLoadingTurnos(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona una imagen válida', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewImage(event.target.result)
      setSavedQr(false)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewImage(event.target.result)
        setSavedQr(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveQr = async () => {
    if (!previewImage) return
    setLoadingQr(true)
    try {
      await configuracionService.saveQR(previewImage)
      setQrImage(previewImage)
      setSavedQr(true)
      showToast('Código QR guardado exitosamente', 'success')
      setTimeout(() => setSavedQr(false), 3000)
    } catch (error) {
      console.error('Error guardando QR:', error)
      showToast('Error al guardar el código QR', 'error')
    } finally {
      setLoadingQr(false)
    }
  }

  const handleRemoveQr = async () => {
    if (!confirm('¿Eliminar la imagen QR de pago?')) return
    try {
      await configuracionService.saveQR('')
      setQrImage(null)
      setPreviewImage(null)
      showToast('Código QR eliminado', 'success')
    } catch (error) {
      console.error('Error eliminando QR:', error)
      showToast('Error al eliminar el código QR', 'error')
    }
  }

  // ==== CONTRASEÑA ====
  const handleChangePwd = (e) => {
    setPwdData({ ...pwdData, [e.target.name]: e.target.value })
    setPwdMessage(null)
  }

  const handleTogglePwd = (field) => {
    setShowPwd({ ...showPwd, [field]: !showPwd[field] })
  }

  const handleCancelPwd = () => {
    setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPwdMessage(null)
  }

  const handleSavePwd = async () => {
    if (!pwdData.currentPassword || !pwdData.newPassword || !pwdData.confirmPassword) {
      showToast('Todos los campos de contraseña son requeridos', 'error')
      return
    }
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      showToast('Las contraseñas nuevas no coinciden', 'error')
      return
    }

    setLoadingPwd(true)
    try {
      const res = await usuarioService.cambiarPassword(user.id, {
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword
      })
      if (res.success) {
        showToast('Contraseña actualizada exitosamente', 'success')
        setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error al cambiar contraseña', 'error')
    } finally {
      setLoadingPwd(false)
    }
  }

  if (loadingInit) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-gray-200 rounded-xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-xl"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card bg-[var(--blanco-primario)] rounded-xl p-6 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-1">
          <QrCode className="text-[var(--guindo-primario)]" />
          Configuración
        </h1>
        <p className="text-sm text-[var(--gris-primario)]">
          Administra la configuración general del sistema y tu perfil
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* QR DE PAGO */}
        <div className="card bg-[var(--blanco-primario)] rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[var(--guindo-primario)] flex items-center gap-2">
              <QrCode size={20} />
              QR de Pago
            </h2>
            <p className="text-sm text-[var(--gris-primario)] mt-1">
              Configura el código QR de cuenta bancaria
            </p>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            <div className="flex flex-col gap-6 items-center">
              
              <div className="flex flex-col items-center gap-3 w-full">
                {previewImage ? (
                  <div className="w-56 h-56 rounded-xl overflow-hidden border-4 border-gray-100 shadow-md bg-white">
                    <img src={previewImage} alt="QR de Pago" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-56 h-56 rounded-xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50">
                    <QrCode size={48} className="text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">Sin imagen QR</p>
                  </div>
                )}
                
                {qrImage && (
                  <button
                    onClick={handleRemoveQr}
                    className="inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={14} /> Eliminar QR
                  </button>
                )}
              </div>

              <div className="w-full">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[var(--guindo-primario)] hover:bg-gray-50 transition-all"
                >
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Arrastra tu imagen QR o selecciona
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, JPEG
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

            </div>

            <div className="mt-auto pt-6 flex justify-between items-end gap-4">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-xs border border-blue-100 flex-1">
                <strong>Nota:</strong> Se muestra en el botón "Cuenta" para que el cliente pague con QR.
              </div>
              <button
                onClick={handleSaveQr}
                disabled={loadingQr || !previewImage || previewImage === qrImage}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--guindo-primario)] text-white rounded-lg hover:opacity-90 font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
              >
                {loadingQr ? (
                  <>Guardando...</>
                ) : savedQr ? (
                  <><Check size={18} /> Guardado</>
                ) : (
                  <>Guardar QR</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CAMBIAR CONTRASEÑA */}
        <div className="card bg-[var(--blanco-primario)] rounded-xl shadow-sm border border-gray-100 flex flex-col md:col-span-full lg:col-span-1">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[var(--guindo-primario)] flex items-center gap-2">
              <Lock size={20} />
              Cambiar Contraseña
            </h2>
            <p className="text-sm text-[var(--gris-primario)] mt-1">
              Actualiza tu contraseña de acceso de forma segura
            </p>
          </div>
          
          <div className="p-6 flex-1 flex flex-col gap-4">
            
            {pwdMessage && (
              <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${pwdMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {pwdMessage.type === 'success' ? <Check size={18} /> : <X size={18} />}
                <span>{pwdMessage.text}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña actual</label>
              <div className="relative">
                <input 
                  type={showPwd.current ? "text" : "password"} 
                  name="currentPassword"
                  value={pwdData.currentPassword}
                  onChange={handleChangePwd}
                  className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[var(--guindo-primario)] focus:ring-1 focus:ring-[var(--guindo-primario)] outline-none pr-10" 
                />
                <button type="button" onClick={() => handleTogglePwd('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <div className="relative">
                <input 
                  type={showPwd.new ? "text" : "password"} 
                  name="newPassword"
                  value={pwdData.newPassword}
                  onChange={handleChangePwd}
                  className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[var(--guindo-primario)] focus:ring-1 focus:ring-[var(--guindo-primario)] outline-none pr-10" 
                />
                <button type="button" onClick={() => handleTogglePwd('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Repetir nueva contraseña</label>
              <div className="relative">
                <input 
                  type={showPwd.confirm ? "text" : "password"} 
                  name="confirmPassword"
                  value={pwdData.confirmPassword}
                  onChange={handleChangePwd}
                  className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[var(--guindo-primario)] focus:ring-1 focus:ring-[var(--guindo-primario)] outline-none pr-10" 
                />
                <button type="button" onClick={() => handleTogglePwd('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="mt-auto pt-4 flex justify-end gap-3">
              <button
                onClick={handleCancelPwd}
                disabled={loadingPwd}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePwd}
                disabled={loadingPwd || !pwdData.currentPassword || !pwdData.newPassword || !pwdData.confirmPassword}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--guindo-primario)] text-white rounded-lg hover:opacity-90 font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
              >
                {loadingPwd ? 'Guardando...' : 'Guardar Contraseña'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* CONFIGURACIÓN DE TURNOS */}
      {user?.rol === 'admin' && (
        <div className="card bg-[var(--blanco-primario)] rounded-xl shadow-sm border border-gray-100 flex flex-col mt-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[var(--guindo-primario)] flex items-center gap-2">
              <Clock size={20} />
              Horarios de Turno
            </h2>
            <p className="text-sm text-[var(--gris-primario)] mt-1">
              Configura los horarios de ingreso y salida para los turnos de los cajeros
            </p>
          </div>
          
          <div className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Turno Mañana */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 border-b pb-2">Turno Mañana</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Hora de Ingreso</label>
                    <input 
                      type="time" 
                      value={turnos.turno_manana_ingreso}
                      onChange={(e) => { setTurnos({...turnos, turno_manana_ingreso: e.target.value}); setSavedTurnos(false); }}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[var(--guindo-primario)] focus:ring-1 focus:ring-[var(--guindo-primario)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Hora de Salida</label>
                    <input 
                      type="time" 
                      value={turnos.turno_manana_salida}
                      onChange={(e) => { setTurnos({...turnos, turno_manana_salida: e.target.value}); setSavedTurnos(false); }}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[var(--guindo-primario)] focus:ring-1 focus:ring-[var(--guindo-primario)] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Turno Tarde */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 border-b pb-2">Turno Tarde</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Hora de Ingreso</label>
                    <input 
                      type="time" 
                      value={turnos.turno_tarde_ingreso}
                      onChange={(e) => { setTurnos({...turnos, turno_tarde_ingreso: e.target.value}); setSavedTurnos(false); }}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[var(--guindo-primario)] focus:ring-1 focus:ring-[var(--guindo-primario)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Hora de Salida</label>
                    <input 
                      type="time" 
                      value={turnos.turno_tarde_salida}
                      onChange={(e) => { setTurnos({...turnos, turno_tarde_salida: e.target.value}); setSavedTurnos(false); }}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[var(--guindo-primario)] focus:ring-1 focus:ring-[var(--guindo-primario)] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 flex justify-end">
              <button
                onClick={handleSaveTurnos}
                disabled={loadingTurnos}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--guindo-primario)] text-white rounded-lg hover:opacity-90 font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
              >
                {loadingTurnos ? (
                  <>Guardando...</>
                ) : savedTurnos ? (
                  <><Check size={18} /> Guardado</>
                ) : (
                  <>Guardar Horarios</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ConfiguracionPage
