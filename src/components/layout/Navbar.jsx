import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Navbar({ user, actions = [], userMenuItems = [], title, subtitle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <header className="h-20 bg-[var(--blanco-primario)] border-b border-gray-200 px-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-[var(--guindo-primario)]">{title}</h1>
        {subtitle && <p className="text-base font-semibold text-[var(--gris-primario)]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {/* Acciones (icon buttons) */}
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
            onClick={() => setMenuOpen(!menuOpen)}
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

          {/* Dropdown */}
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