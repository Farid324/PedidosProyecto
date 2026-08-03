import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Bell, Check, CheckCheck, Trash2, Clock } from 'lucide-react'

// Skeleton loader component
function NotificationSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
          <div className="w-20 h-6 bg-gray-100 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  )
}

export default function NotificacionesPage() {
  // Usar el estado compartido desde AdminLayout via Outlet context
  const { notifications, setNotifications } = useOutletContext()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Breve delay para mostrar el skeleton
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--gris-primario)]">Notificaciones</h1>
          <p className="text-[var(--gris-primario)] mt-1">
            {unreadCount > 0
              ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
              : 'Todas las notificaciones están al día'}
          </p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--azul-primario)] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold text-sm"
            >
              <CheckCheck size={18} />
              Marcar todas como leídas
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm"
            >
              <Trash2 size={18} />
              Limpiar todo
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <NotificationSkeleton />
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={36} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">Sin notificaciones</h3>
          <p className="text-gray-500 text-sm">
            No tienes notificaciones en este momento. Las nuevas actividades aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white rounded-xl border shadow-sm p-5 flex items-start gap-4 transition-all hover:shadow-md ${
                !notif.read
                  ? 'border-[var(--azul-primario)]/30 bg-blue-50/30'
                  : 'border-gray-100'
              }`}
            >
              {/* Icono */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                !notif.read
                  ? 'bg-[var(--azul-primario)] text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <Bell size={18} />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${
                  !notif.read ? 'font-semibold text-gray-800' : 'text-gray-600'
                }`}>
                  {notif.text}
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-400">{notif.time}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1 shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-2 text-gray-400 hover:text-[var(--azul-primario)] hover:bg-blue-50 rounded-lg transition-colors"
                    title="Marcar como leída"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
