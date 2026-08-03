// src/router.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Páginas
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard'
import GestionMenuPage from './pages/Admin/Gestion/GestionMenuPage'
import ReportesPageAdmin from './pages/Admin/Reportes/ReportesPage'
import UsuariosPage from './pages/Admin/Usuarios/UsuariosPage'
import ConfiguracionPage from './pages/Admin/Configuracion/ConfiguracionPage'
import NotificacionesPage from './pages/Admin/Notificaciones/NotificacionesPage'
import PerfilPage from './pages/Admin/Perfil/PerfilPage'
import CajeroDashboard from './pages/employee/Dashboard/CajeroDashboard'
import PedidosPage from './pages/employee/Pedidos/PedidosPage'
import FacturacionPage from './pages/employee/Facturacion/FacturacionPage'
import ReportesPageEmployee from './pages/employee/Reportes/ReportesPage'
import MenuPage from './pages/MenuPage'
import NotFoundPage from './pages/NotFoundPage'

// Layouts
import AdminLayout from './components/layout/AdminLayout'
import CajeroLayout from './components/layout/CajeroLayout'

// Componente para proteger rutas
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Configuración del router
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />
      },
      {
        path: 'gestion-menu',
        element: <GestionMenuPage />
      },
      {
        path: 'menu',
        element: <MenuPage />
      },
      {
        path: 'facturas',
        element: <FacturacionPage />
      },
      {
        path: 'usuarios',
        element: <UsuariosPage />
      },
      {
        path: 'reportes',
        element: <ReportesPageAdmin />
      },
      {
        path: 'notificaciones',
        element: <NotificacionesPage />
      },
      {
        path: 'configuracion',
        element: <ConfiguracionPage />
      },
      {
        path: 'perfil',
        element: <PerfilPage />
      },
    ]
  },
  {
    path: '/cajero',
    element: (
      <ProtectedRoute allowedRoles={['cajero']}>
        <CajeroLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/cajero/pedidos" replace />
      },
      {
        path: 'dashboard',
        element: <CajeroDashboard />
      },
      {
        path: 'pedidos',
        element: <PedidosPage />
      },
      {
        path: 'facturacion',
        element: <FacturacionPage />
      },
      {
        path: 'reportes',
        element: <ReportesPageEmployee />
      },
      {
        path: 'perfil',
        element: <PerfilPage />
      }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
])

export default router