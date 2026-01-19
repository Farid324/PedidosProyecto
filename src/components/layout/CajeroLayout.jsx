// src/components/layout/CajeroLayout.jsx
import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  ShoppingCart, FileText, Clock, LogOut, DollarSign, Home,
  Receipt, User, Sun, Moon
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

function CajeroLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, turno, logout } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Menú limitado para cajeros
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      path: '/cajero/dashboard',
      badge: null 
    },
    { 
      id: 'pedidos', 
      label: 'Registrar Pedido', 
      icon: ShoppingCart, 
      path: '/cajero/pedidos',
      badge: null 
    },
    { 
      id: 'facturacion', 
      label: 'Facturación', 
      icon: Receipt, 
      path: '/cajero/facturacion',
      badge: null 
    },
    { 
      id: 'cobros', 
      label: 'Cobros Pendientes', 
      icon: DollarSign, 
      path: '/cajero/cobros',
      badge: '5' 
    },
    { 
      id: 'reportes', 
      label: 'Mi Reporte', 
      icon: FileText, 
      path: '/cajero/reportes',
      badge: null 
    },
  ]

  const navbarActions = [
    {
      icon: turno === 'AM' ? Sun : Moon,
      label: `Turno ${turno}`,
      onClick: () => {}
    },
    {
      icon: Clock,
      label: 'Hora',
      text: new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
      onClick: () => {}
    }
  ]

  const userMenuItems = [
    {
      label: 'Mi Turno',
      icon: Clock,
      text: `${turno} - ${user?.name}`,
      onClick: () => {}
    },
    {
      label: 'Cerrar Turno',
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
        userRole="cajero"
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          user={user}
          actions={navbarActions}
          userMenuItems={userMenuItems}
          title={`Cajero: ${user?.name}`}
          subtitle={`Turno ${turno}`}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default CajeroLayout