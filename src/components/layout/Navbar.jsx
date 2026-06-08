import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ 
  user, 
  actions = [], 
  userMenuItems = [], 
  notifications = [], 
  setNotifications, 
  title, 
  subtitle 
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    if (setNotifications) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleNotifClick = () => {
    setNotifOpen(!notifOpen);
    setMenuOpen(false);
  };

  const handleVerMas = () => {
    setNotifOpen(false);
    navigate('/admin/reportes');
  };

  return (
    <header className="h-20 bg-[var(--blanco-primario)] border-b border-gray-200 px-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-[var(--guindo-primario)]">{title}</h1>
        {subtitle && <p className="text-base font-semibold text-[var(--gris-primario)]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        
        {/* Campana de Notificaciones (Admin) */}
        {setNotifications && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleNotifClick}
              className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-all text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200"
              title="Notificaciones"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse shadow-md border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Notificaciones */}
            {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden transform origin-top-right transition-all">
                <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-800">Notificaciones</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-[var(--guindo-primario)] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Check size={12} /> Marcar leído
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">
                      No tienes notificaciones
                    </div>
                  ) : (
                    notifications.slice(0, 3).map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-3 text-xs transition-colors hover:bg-gray-50 ${!notif.read ? 'bg-orange-50/40 font-semibold' : ''}`}
                      >
                        <p className="text-gray-800 leading-relaxed">{notif.text}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">{notif.time}</span>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <button
                    onClick={handleVerMas}
                    className="w-full text-center py-2.5 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-[var(--guindo-primario)] border-t border-gray-100 transition-colors"
                  >
                    Ver todas en Reportes
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Acciones genéricas (si hay) */}
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <button
              key={i}
              onClick={a.onClick}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition"
              title={a.label}
            >
              <Icon size={20} />
              {a.badge && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full px-1">
                  {a.badge}
                </span>
              )}
              {a.text && <span className="ml-2 text-sm text-gray-700">{a.text}</span>}
            </button>
          );
        })}

        {/* Menú de usuario */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => {
              setMenuOpen(!menuOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.foto ? (
                <img src={user.foto} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <span>{(user?.nombre || user?.email || 'U')?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold leading-4 truncate max-w-[150px]">{user?.nombre || 'Usuario'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || user?.rol || '—'}</p>
            </div>
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Usuario */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <ul className="py-1">
                {userMenuItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i}>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          item.onClick();
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${item.className || ''}`}
                      >
                        {Icon && <Icon size={16} />}
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.text && <span className="text-xs text-gray-500">{item.text}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}