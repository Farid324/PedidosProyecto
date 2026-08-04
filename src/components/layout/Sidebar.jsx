// src/components/layout/Sidebar.jsx
import { LuPanelRight } from "react-icons/lu";
import { LogOut } from 'lucide-react'
import LogoConLetra from '../../assets/images/LogoAtavismoLetra.png';

function Sidebar({ menuItems, collapsed, onToggle, currentPath, onNavigate, userRole, onLogout }) {
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
              <img src={LogoConLetra} alt="Logo Casa Valluna" />
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
      <div className="p-3 border-t border-[var(--grisShadow-primario)]">
        <button 
          onClick={onLogout}
          title={collapsed ? "Cerrar Sesión" : ""} // Tooltip útil cuando está colapsado
          className={`
            flex items-center rounded-lg border-2 text-[var(--blanco-primario)] font-semibold transition-colors
            bg-transparent hover:bg-[var(--blancoShadow-primario)] hover:bg-opacity-80
            ${collapsed 
              ? 'justify-center w-full py-2'    // Estilos cuando está CERRADO (centrado)
              : 'justify-start w-full gap-3 px-3 py-2.5' // Estilos cuando está ABIERTO (con gap)
            }
          `}
        >
          <LogOut size={20} />
          
          {/* Aquí está la magia: El texto solo se muestra si NO está colapsado */}
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar