// src/components/common/Modal.jsx
import { X } from 'lucide-react'

function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
  variant = 'dialog', // 'dialog' o 'inline'
  showClose = true,
  titleClass = '',
  subtitleClass = '',

  // 🔽 NUEVO: imagen opcional
  imageSrc,        // string | undefined
  imageAlt = '',   // string
  imageClass = '', // clases tailwind extras
  image,           // ReactNode opcional. Si viene, se usa en lugar de <img>
}) {
  if (!isOpen) return null

  const Header = (
    <div className="flex flex-col items-center text-center p-6 pb-4 relative">
      {showClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={22} />
        </button>
      )}

      {/* 🔽 Imagen opcional arriba del título */}
      {(image || imageSrc) && (
        <div className="mb-3">
          {image ? (
            image
          ) : (
            <img
              src={imageSrc}
              alt={imageAlt}
              className={`h-0 w-0 object-cover rounded-full shadow ${imageClass}`}
            />
          )}
        </div>
      )}

      <h3 className={`text-2xl font-bold text-gray-800 ${titleClass}`}>{title}</h3>
      {subtitle && (
        <p className={`text-gray-600 text-sm mt-1 ${subtitleClass}`}>{subtitle}</p>
      )}
    </div>
  )

  if (variant === 'inline') {
    return (
      <div className={`relative bg-white rounded-2xl shadow-2xl ${maxWidth} w-full text-left mx-auto`}>
        {Header}
        <div className="px-6 pb-6">{children}</div>
      </div>
    )
  }

  // Modal flotante
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className={`relative bg-white rounded-2xl shadow-2xl ${maxWidth} w-full transform transition-all`}>
          {Header}
          <div className="px-6 pb-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Modal
