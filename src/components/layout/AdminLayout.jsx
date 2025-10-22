// src/components/layout/AdminLayout.jsx
import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, ShoppingCart, FileText, TrendingUp, Settings, Users, 
  Menu as MenuIcon, X, LogOut, ChefHat, Package, ChevronDown,
  Bell, Search, User
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      path: '/admin/dashboard',
      badge: null 
    },
    { 
      id: 'reportes', 
      label: 'Reportes', 
      icon: TrendingUp, 
      path: '/admin/reportes',
      badge: null 
    },
  ]

  const navbarActions = [
    {
      icon: Search,
      label: 'Buscar',
      onClick: () => console.log('Buscar')
    },
    {
      icon: Bell,
      label: 'Notificaciones',
      badge: '5',
      onClick: () => console.log('Notificaciones')
    }
  ]

  const userMenuItems = [
    {
      label: 'Mi Perfil',
      icon: User,
      onClick: () => navigate('/admin/perfil')
    },
    {
      label: 'Configuración',
      icon: Settings,
      onClick: () => navigate('/admin/configuracion')
    },
    {
      label: 'Cerrar Sesión',
      icon: LogOut,
      onClick: handleLogout,
      className: 'text-red-600 hover:bg-red-50'
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        menuItems={menuItems}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={location.pathname}
        onNavigate={(path) => navigate(path)}
        userRole="admin"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          user={user}
          actions={navbarActions}
          userMenuItems={userMenuItems}
          title="Panel de Administración"
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--blancoFondo-primario)]">
          <div className="container mx-auto px-6 py-8 bg-[var(--blancoFondo-primario)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout