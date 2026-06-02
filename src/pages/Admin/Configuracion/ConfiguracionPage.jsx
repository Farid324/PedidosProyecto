// src/pages/Admin/Configuracion/ConfiguracionPage.jsx
import { useState, useEffect, useRef } from 'react'
import { Upload, QrCode, Check, Trash2, Image as ImageIcon, User, Camera, Eye, EyeOff, Lock, X } from 'lucide-react'
import configuracionService from '../../../services/configuracionService'

import useAuthStore from '../../../store/authStore'
import usuarioService from '../../../services/usuarioService'

function ConfiguracionPage() {
  const { user } = useAuthStore()

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
    fetchQR()
  }, [])

  const fetchQR = async () => {
    try {
      const res = await configuracionService.getQR()
      if (res.data && res.data.valor) {
        setQrImage(res.data.valor)
        setPreviewImage(res.data.valor)
      }
    } catch (error) {
      console.error('Error cargando QR:', error)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida')
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
      setTimeout(() => setSavedQr(false), 3000)
    } catch (error) {
      console.error('Error guardando QR:', error)
      alert('Error al guardar el QR')
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
    } catch (error) {
      console.error('Error eliminando QR:', error)
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
      setPwdMessage({ type: 'error', text: 'Todos los campos son requeridos' })
      return
    }
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' })
      return
    }

    setLoadingPwd(true)
    try {
      const res = await usuarioService.cambiarPassword(user.id, {
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword
      })
      if (res.success) {
        setPwdMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' })
        setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (error) {
      setPwdMessage({ type: 'error', text: error.response?.data?.message || 'Error al cambiar contraseña' })
    } finally {
      setLoadingPwd(false)
    }
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
    </div>
  )
}

export default ConfiguracionPage
