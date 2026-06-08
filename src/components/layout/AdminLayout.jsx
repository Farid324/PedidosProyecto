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
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_notifications')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })
  const processedPedidos = useRef(new Set())
  const isFirstLoad = useRef(true)

  // Persistir notificaciones
  useEffect(() => {
    localStorage.setItem('admin_notifications', JSON.stringify(notifications))
  }, [notifications])

  // Polling para detectar nuevos pedidos finalizados y accesos
  useEffect(() => {
    let notifyAccesos = false;
    
    // Obtener la configuración inicial
    const initConfig = async () => {
      try {
        const configRes = await api.get('/config/notificar_accesos_admin');
        notifyAccesos = configRes.data?.data?.valor === 'true';
      } catch(e) {}
    }
    initConfig();

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

          if (isFirstLoad.current) {
            // En la primera carga, registrar todos los completados existentes para no alertar de cosas pasadas
            completadosHoy.forEach(p => processedPedidos.current.add(`pedido_${p.id}`));
          } else {
            // Buscar si hay pedidos completados nuevos (cuyo ID no esté en el Set)
            completadosHoy.forEach(pedido => {
              if (!processedPedidos.current.has(`pedido_${pedido.id}`)) {
                // Registrar el nuevo ID para no repetir
                processedPedidos.current.add(`pedido_${pedido.id}`);

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
          }
        }

        // Consultar accesos si está activo
        if (notifyAccesos) {
          try {
            const accRes = await api.get(`/auth/accesos?fecha=${todayStr}`);
            if (accRes.data.success) {
              const accesos = accRes.data.data;
              
              if (isFirstLoad.current) {
                // En la primera carga, registrar todos los accesos existentes
                accesos.forEach(a => {
                  processedPedidos.current.add(`acceso_ingreso_${a.id}`);
                  if (a.fecha_salida) processedPedidos.current.add(`acceso_salida_${a.id}`);
                });
                isFirstLoad.current = false;
              } else {
                accesos.forEach(a => {
                  // Chequear ingreso
                  if (!processedPedidos.current.has(`acceso_ingreso_${a.id}`)) {
                    processedPedidos.current.add(`acceso_ingreso_${a.id}`);
                    const horaIngreso = new Date(a.fecha_ingreso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
                    setNotifications(prev => [
                      {
                        id: Date.now() + Math.random(),
                        text: `Usuario ${a.nombre_cajero} ingresó a turno ${a.turno === 'AM' ? 'mañana' : 'tarde'}`,
                        time: horaIngreso,
                        read: false
                      },
                      ...prev
                    ]);
                    playNotificationSound();
                  }

                  // Chequear salida
                  if (a.fecha_salida && !processedPedidos.current.has(`acceso_salida_${a.id}`)) {
                    processedPedidos.current.add(`acceso_salida_${a.id}`);
                    const horaSalida = new Date(a.fecha_salida).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
                    setNotifications(prev => [
                      {
                        id: Date.now() + Math.random(),
                        text: `Usuario ${a.nombre_cajero} salió de turno ${a.turno === 'AM' ? 'mañana' : 'tarde'}`,
                        time: horaSalida,
                        read: false
                      },
                      ...prev
                    ]);
                    playNotificationSound();
                  }
                });
              }
            }
          } catch(e) { console.error(e) }
        } else if (isFirstLoad.current) {
            isFirstLoad.current = false;
        }

      } catch (error) {
        console.error("Error checking new orders/accesos for notifications:", error);
      }
    };

    checkNewOrders(); // Ejecución inicial
    const interval = setInterval(checkNewOrders, 5000); // Polling cada 5s para que sea más rápido
    
    // Verificar si la configuración de notificaciones cambió (polling lento)
    const configInterval = setInterval(initConfig, 60000);
    
    return () => { clearInterval(interval); clearInterval(configInterval); }
  }, []);

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
        onLogout={handleLogout}
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
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout