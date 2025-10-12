// src/components/layout/Sidebar.jsx
import { ChevronLeft, ChevronRight, ChefHat } from 'lucide-react'

function Sidebar({ menuItems, collapsed, onToggle, currentPath, onNavigate, userRole }) {
  const isActive = (path) => currentPath === path

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`${userRole === 'admin' ? 'bg-purple-100' : 'bg-blue-100'} p-2 rounded-lg`}>
            <ChefHat className={`${userRole === 'admin' ? 'text-purple-600' : 'text-blue-600'}`} size={24} />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-gray-800">Restaurant POS</h2>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                    ${active 
                      ? userRole === 'admin'
                        ? 'bg-purple-50 text-purple-700 font-semibold'
                        : 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
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
        <div className="p-4 border-t border-gray-200">
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