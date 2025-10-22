// src/components/layout/Sidebar.jsx
import { LuPanelRight } from "react-icons/lu";
function Sidebar({ menuItems, collapsed, onToggle, currentPath, onNavigate, userRole }) {
  const isActive = (path) => currentPath === path

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-[var(--guindo-primario)] transition-all duration-300 flex flex-col rounded-r-3xl`}>
      {/* Logo */}
      <div className="h-auto w-auto flex flex-col items-center justify-between px-4 py-4 border-b border-[var(--grisShadow-primario)]">
        <button
          onClick={onToggle}
          className={`py-3 rounded-lg transition-colors flex w-full ${
            collapsed
              ? 'justify-center bg-transparent text-[var(--blanco-primario)] hover:bg-[var(--blanco-primario)] hover:text-[var(--guindo-primario)]'
              : 'justify-end text-[var(--blanco-primario)]'
          }`}
          aria-pressed={!collapsed}
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          <LuPanelRight size={20} className="transition-colors" />
          <span className="sr-only">{collapsed ? 'Expandir panel' : 'Colapsar panel'}</span>
        </button>
        {!collapsed && (
            <div>
              <img src="\src\assets\images\LogoAtavismoLetra.png" alt="LogoConLetra" />
            </div>
          )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-10">
        <ul className="space-y-1 px-3 flex flex-col gap-5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-base font-semibold border-2
                    ${active 
                      ? userRole === 'admin'
                        ? 'bg-purple-50 text-[var(--guindo-primario)] font-bold'
                        : 'bg-blue-50 text-[var(--guindo-primario)] !font-bold'
                      : 'text-gray-600 hover:bg-[var(--blancoShadow-primario)] !text-[var(--blanco-primario)]'
                    }
                  `}
                >
                  <Icon size={20} className={collapsed ? 'mx-auto' : ''} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className={`
                          px-2 py-0.5 text-xs rounded-full
                          ${active 
                            ? userRole === 'admin'
                              ? 'bg-purple-200 text-purple-800'
                              : 'bg-blue-200 text-blue-800'
                            : 'bg-gray-200 text-gray-600'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-4 border-t border-[var(--grisShadow-primario)]">
          <div className={`${userRole === 'admin' ? 'bg-purple-50' : 'bg-blue-50'} rounded-lg p-3`}>
            <p className="text-xs font-semibold text-gray-600 mb-1">Versión</p>
            <p className="text-sm font-bold text-gray-800">v1.0.0</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar