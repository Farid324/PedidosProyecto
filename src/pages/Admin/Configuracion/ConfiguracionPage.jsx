// src/pages/Admin/Configuracion/ConfiguracionPage.jsx
import { useState, useEffect, useRef } from 'react'
import { Upload, QrCode, Check, Trash2, Image as ImageIcon } from 'lucide-react'
import configuracionService from '../../../services/configuracionService'

function ConfiguracionPage() {
  const [qrImage, setQrImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef(null)

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
      setSaved(false)
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
        setSaved(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!previewImage) return
    setLoading(true)
    try {
      await configuracionService.saveQR(previewImage)
      setQrImage(previewImage)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error guardando QR:', error)
      alert('Error al guardar el QR')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('¿Eliminar la imagen QR de pago?')) return
    try {
      await configuracionService.saveQR('')
      setQrImage(null)
      setPreviewImage(null)
    } catch (error) {
      console.error('Error eliminando QR:', error)
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
          Administra la configuración general del sistema
        </p>
      </div>

      {/* QR de Pago */}
      <div className="card bg-[var(--blanco-primario)] rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[var(--guindo-primario)] flex items-center gap-2">
            <QrCode size={20} />
            QR de Pago
          </h2>
          <p className="text-sm text-[var(--gris-primario)] mt-1">
            Sube la imagen del código QR de tu cuenta bancaria para que los clientes puedan pagar con QR
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Preview del QR */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium text-gray-600">QR Actual</p>
              {previewImage ? (
                <div className="w-64 h-64 rounded-xl overflow-hidden border-4 border-gray-100 shadow-lg bg-white">
                  <img src={previewImage} alt="QR de Pago" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-64 h-64 rounded-xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50">
                  <QrCode size={48} className="text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Sin imagen QR</p>
                </div>
              )}
              
              {qrImage && (
                <button
                  onClick={handleRemove}
                  className="inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={14} /> Eliminar QR
                </button>
              )}
            </div>

            {/* Upload Area */}
            <div className="flex-1 w-full">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[var(--guindo-primario)] hover:bg-gray-50 transition-all"
              >
                <Upload size={40} className="mx-auto text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Arrastra tu imagen QR aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-400">
                  Formatos: PNG, JPG, JPEG
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSave}
                  disabled={loading || !previewImage || previewImage === qrImage}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--guindo-primario)] text-white rounded-lg hover:opacity-90 font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <>Guardando...</>
                  ) : saved ? (
                    <><Check size={18} /> Guardado</>
                  ) : (
                    <>Guardar QR</>
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs border border-blue-100">
                <strong>Nota:</strong> Esta imagen se mostrará a los cajeros cuando presionen el botón "Cuenta" durante el registro de un pedido. El cliente podrá escanear el QR para pagar.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfiguracionPage
