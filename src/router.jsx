// src/router.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Páginas
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import CajeroDashboard from './pages/CajeroDashboard'
import PedidosPage from './pages/PedidosPage'
import FacturacionPage from './pages/FacturacionPage'
import ReportesPage from './pages/ReportesPage'
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
        path: 'pedidos',
        element: <PedidosPage />
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
        path: 'reportes',
        element: <ReportesPage />
      }
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
        path: 'pedidos',
        element: <PedidosPage />
      },
      {
        path: 'facturacion',
        element: <FacturacionPage />
      },
      {
        path: 'reportes',
        element: <ReportesPage />
      }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
])

export default router