// src/components/layout/AdminLayout.jsx
import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, TrendingUp, Settings, Users, 
  LogOut, Package, Bell, User
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import LogoutModal from '../common/LogoutModal'

// Sintetizador de audio para la notificación
const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    // Primer tono (D5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.setValueAtTime(880.00, now + 0.12); // Segundo tono ascendente (A5)
    
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.5);
  } catch (e) {
    console.error("Audio Context no soportado o bloqueado:", e);
  }
}

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_notifications')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })
  const processedPedidos = useRef(new Set(JSON.parse(localStorage.getItem('admin_processed_pedidos') || '[]')))
  const isFirstLoad = useRef(true)

  // Persistir notificaciones
  useEffect(() => {
    localStorage.setItem('admin_notifications', JSON.stringify(notifications))
  }, [notifications])

  // Polling para detectar nuevos pedidos finalizados
  useEffect(() => {
    const checkNewOrders = async () => {
      try {
        // Obtener fecha local en YYYY-MM-DD para evitar desfase de zona horaria (UTC vs Local)
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        const todayStr = (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];

        const res = await api.get(`/reportes/admin-dashboard?date=${todayStr}`);
        if (res.data.success) {
          const { pedidos_recientes } = res.data.data;
          
          // Filtrar pedidos completados en la lista reciente
          const completadosHoy = pedidos_recientes.filter(p => p.estado === 'completado');

          // Initialize local storage silently if it's perfectly empty (never used before)
          if (!localStorage.getItem('admin_processed_pedidos')) {
            completadosHoy.forEach(p => processedPedidos.current.add(`pedido_${p.id}`));
            localStorage.setItem('admin_processed_pedidos', JSON.stringify(Array.from(processedPedidos.current)));
            // return; NO RETURN HERE, we want it to continue processing auditories if needed
          } else {
            let newOrdersFound = false;
            // Buscar si hay pedidos completados nuevos (cuyo ID no esté en el Set)
            completadosHoy.forEach(pedido => {
              if (!processedPedidos.current.has(`pedido_${pedido.id}`)) {
                // Registrar el nuevo ID para no repetir
                processedPedidos.current.add(`pedido_${pedido.id}`);
                newOrdersFound = true;

                // Disparar notificación
                const notifMsg = `Mesa ${pedido.cliente.replace('Mesa ', '')}: Pedido finalizado por ${pedido.total}`;
                setNotifications(prev => [
                  {
                    id: Date.now() + Math.random(),
                    text: notifMsg,
                    time: pedido.hora || new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
                    read: false
                  },
                  ...prev
                ]);
                playNotificationSound();
              }
            });

            if (newOrdersFound) {
              localStorage.setItem('admin_processed_pedidos', JSON.stringify(Array.from(processedPedidos.current)));
            }
          }
        }

        // Revisar auditorías de login/logout
        try {
          const resAuditoria = await api.get(`/auditoria/recientes?date=${todayStr}`);
          if (resAuditoria.data.success) {
            const auditos = resAuditoria.data.data;

            if (!localStorage.getItem('admin_processed_audits')) {
              auditos.forEach(a => processedPedidos.current.add(`audit_${a.id}`));
              localStorage.setItem('admin_processed_audits', JSON.stringify(Array.from(processedPedidos.current)));
            } else {
              let newAuditsFound = false;
              auditos.forEach(a => {
                if (!processedPedidos.current.has(`audit_${a.id}`)) {
                  processedPedidos.current.add(`audit_${a.id}`);
                  newAuditsFound = true;

                  const actionText = a.accion === 'login' ? 'ha iniciado sesión' : 'ha cerrado sesión';
                  const notifMsg = `El cajero ${a.nombre_usuario} ${actionText} (Turno ${a.turno || 'N/A'})`;
                  setNotifications(prev => [
                    {
                      id: Date.now() + Math.random(),
                      text: notifMsg,
                      time: new Date(a.createdAt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
                      read: false
                    },
                    ...prev
                  ]);
                  playNotificationSound();
                }
              });

              if (newAuditsFound) {
                localStorage.setItem('admin_processed_audits', JSON.stringify(Array.from(processedPedidos.current)));
              }
            }
          }
        } catch (e) {
          console.error("Error checking audits for notifications:", e);
        }

      } catch (error) {
        console.error("Error checking new orders for notifications:", error);
      }
    };

    checkNewOrders(); // Ejecución inicial
    const interval = setInterval(checkNewOrders, 5000); // Polling cada 5s
    
    return () => clearInterval(interval);
  }, []);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false)
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
      id: 'gestion-menu', 
      label: 'Gestión de Menú', 
      icon: Package, 
      path: '/admin/gestion-menu',
      badge: null 
    },
    { 
      id: 'usuarios', 
      label: 'Usuarios', 
      icon: Users, 
      path: '/admin/usuarios',
      badge: null 
    },
    { 
      id: 'reportes', 
      label: 'Reportes', 
      icon: TrendingUp, 
      path: '/admin/reportes',
      badge: null 
    },
    { 
      id: 'notificaciones', 
      label: 'Notificaciones', 
      icon: Bell, 
      path: '/admin/notificaciones',
      badge: null 
    },
    { 
      id: 'perfil', 
      label: 'Mi Perfil', 
      icon: User, 
      path: '/admin/perfil',
      badge: null 
    },
    { 
      id: 'configuracion', 
      label: 'Configuración', 
      icon: Settings, 
      path: '/admin/configuracion',
      badge: null 
    },
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
      onClick: handleLogoutClick,
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
        onLogout={handleLogoutClick}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          user={user}
          userMenuItems={userMenuItems}
          notifications={notifications}
          setNotifications={setNotifications}
          title="PANEL ADMINISTRADOR"
          subtitle={`Usuario: ${user?.nombre || 'Administrador'}`}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[var(--blancoFondo-primario)]">
          <div className="container mx-auto px-4 py-8 bg-[var(--blancoFondo-primario)]">
            <Outlet context={{ notifications, setNotifications }} />
          </div>
        </main>
      </div>

      {/* Modal de Cerrar Sesión */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  )
}

export default AdminLayout