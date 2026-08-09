import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { 
  ShoppingCart, FileText, Clock, LogOut, Home,
  Receipt, User, Sun, Moon
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
    
    // Tono para el cajero (más suave)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440.00, now); // A4
    osc1.frequency.setValueAtTime(659.25, now + 0.15); // E5
    
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.4);
  } catch (e) {
    console.error("Audio Context no soportado o bloqueado:", e);
  }
}

function CajeroLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, turno, logout, cambiarTurno } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, 3000)
  }
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(`cajero_notifications_${user?.id || 'default'}`)
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })
  
  useEffect(() => {
    localStorage.setItem(`cajero_notifications_${user?.id || 'default'}`, JSON.stringify(notifications))
  }, [notifications, user])
  const warned15Min = useRef(false)
  const warnedFin = useRef(false)
  const warnedPendientes = useRef(new Set())

  // Reloj en tiempo real
  const [currentTime, setCurrentTime] = useState(new Date())

  // Configuración de turnos para validar el cambio
  const [configTurnos, setConfigTurnos] = useState({
    turno_manana_ingreso: '',
    turno_manana_salida: '',
    turno_tarde_ingreso: '',
    turno_tarde_salida: ''
  })

  useEffect(() => {
    let notifyFinTurno = false;
    let horaSalidaTurno = '';

    const fetchConfig = async () => {
      try {
        const configRes = await api.get('/config/notificar_fin_turno_cajero');
        notifyFinTurno = configRes.data?.data?.valor === 'true';

        if (notifyFinTurno) {
          const turnoKey = turno === 'AM' ? 'turno_manana_salida' : 'turno_tarde_salida';
          const turnoRes = await api.get(`/config/${turnoKey}`);
          horaSalidaTurno = turnoRes.data?.data?.valor || '';
        }

        // Cargar horarios para validación de cambio de turno
        const [tmIngreso, tmSalida, ttIngreso, ttSalida] = await Promise.all([
          api.get('/config/turno_manana_ingreso'),
          api.get('/config/turno_manana_salida'),
          api.get('/config/turno_tarde_ingreso'),
          api.get('/config/turno_tarde_salida')
        ]);
        
        setConfigTurnos({
          turno_manana_ingreso: tmIngreso.data?.data?.valor || '08:00',
          turno_manana_salida: tmSalida.data?.data?.valor || '14:00',
          turno_tarde_ingreso: ttIngreso.data?.data?.valor || '14:00',
          turno_tarde_salida: ttSalida.data?.data?.valor || '22:00'
        });

      } catch(e) {}
    }

    fetchConfig();

    const checkTimeAndPedidos = async () => {
      const now = new Date();
      setCurrentTime(now); // Actualizar reloj en Navbar

      // 1. Revisión de fin de turno
      if (notifyFinTurno && horaSalidaTurno) {
        const [hSalida, mSalida] = horaSalidaTurno.split(':').map(Number);
        const salidaDate = new Date();
        salidaDate.setHours(hSalida, mSalida, 0, 0);

        const diffMs = salidaDate - now;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins <= 15 && diffMins > 0 && !warned15Min.current) {
          warned15Min.current = true;
          setNotifications(prev => [
            {
              id: Date.now(),
              text: `Aviso: Faltan ${diffMins} minutos para que termine su turno (${horaSalidaTurno}).`,
              time: now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
              read: false
            },
            ...prev
          ]);
          playNotificationSound();
        }

        if (diffMins <= 0 && diffMins >= -120 && !warnedFin.current) { // Solo avisar si no pasaron más de 2h
          warnedFin.current = true;
          setNotifications(prev => [
            {
              id: Date.now() + 1,
              text: `Aviso: Su turno ha finalizado (${horaSalidaTurno}). Debe cambiar de turno o cerrar sesión.`,
              time: now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
              read: false
            },
            ...prev
          ]);
          playNotificationSound();
        }
      }

      // 2. Revisión de pedidos pendientes por > 20 mins
      try {
        const res = await api.get('/pedidos?estado=pendiente');
        const pedidos = res.data?.data || [];
        
        pedidos.forEach(p => {
          const createdAt = new Date(p.created_at);
          const diffMs = now - createdAt;
          const diffMins = Math.floor(diffMs / 60000);

          if (diffMins >= 20 && !warnedPendientes.current.has(p.id)) {
            warnedPendientes.current.add(p.id);
            setNotifications(prev => [
              {
                id: Date.now() + p.id,
                text: `Alerta: Mesa ${p.mesa} lleva más de 20 minutos en modo pendiente.`,
                time: now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
                read: false
              },
              ...prev
            ]);
            playNotificationSound();
          }
        });
      } catch (e) {
        console.error("Error verificando pedidos pendientes", e);
      }
    };

    const interval = setInterval(checkTimeAndPedidos, 60000); // Revisar cada minuto
    return () => clearInterval(interval);
  }, [turno]);

  // Actualizar el reloj cada 10 segundos para mayor precisión
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(clockInterval);
  }, []);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false)
    
    // Auto-finalizar mesas al cerrar sesión
    try {
      const [resPend, resProc] = await Promise.all([
        api.get('/pedidos?estado=pendiente'),
        api.get('/pedidos?estado=en_proceso')
      ]);
      const pedidosPendientes = resPend.data?.data || [];
      const pedidosProceso = resProc.data?.data || [];
      const todos = [...pedidosPendientes, ...pedidosProceso];

      for (const pedido of todos) {
        await api.put(`/pedidos/${pedido.id}/finalizar`, { 
          metodo_pago: pedido.pago_pedidosya ? 'PEDIDOSYA' : (pedido.pago_tarjeta ? 'TARJETA' : (pedido.pago_qr ? 'QR' : 'EFECTIVO')) 
        });
      }
    } catch (error) {
      console.error("Error auto-finalizando mesas al cerrar sesión:", error);
    }

    logout()
    navigate('/login')
  }

    const handleCambiarTurno = async () => {
    const nuevoTurno = turno === 'AM' ? 'PM' : 'AM';
    const now = new Date();
    
    // Validar horarios
    let puedeCambiar = false;
    let mensajeError = '';

    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const currentMins = now.getHours() * 60 + now.getMinutes();

    if (nuevoTurno === 'PM') {
      const amSalidaMins = timeToMinutes(configTurnos.turno_manana_salida);
      if (currentMins > amSalidaMins) {
        puedeCambiar = true;
      } else {
        mensajeError = `Sigue en el turno de la mañana. (Finaliza a las ${configTurnos.turno_manana_salida})`;
      }
    } else { // nuevoTurno === 'AM'
      const pmSalidaMins = timeToMinutes(configTurnos.turno_tarde_salida);
      if (currentMins > pmSalidaMins || currentMins < timeToMinutes(configTurnos.turno_manana_salida)) { 
        puedeCambiar = true; 
      } else {
        mensajeError = `Sigue en el turno de la tarde. (Finaliza a las ${configTurnos.turno_tarde_salida})`;
      }
    }

    if (!puedeCambiar) {
      showToast(mensajeError, 'error'); 
      return;
    }

    if (window.confirm(`¿Quieres cambiar de turno ${turno} a turno ${nuevoTurno}?`)) {
      // Auto-finalizar mesas al cambiar de turno
      try {
        const [resPend, resProc] = await Promise.all([
          api.get('/pedidos?estado=pendiente'),
          api.get('/pedidos?estado=en_proceso')
        ]);
        const pedidosPendientes = resPend.data?.data || [];
        const pedidosProceso = resProc.data?.data || [];
        const todos = [...pedidosPendientes, ...pedidosProceso];

        for (const pedido of todos) {
          await api.put(`/pedidos/${pedido.id}/finalizar`, { 
            metodo_pago: pedido.pago_pedidosya ? 'PEDIDOSYA' : (pedido.pago_tarjeta ? 'TARJETA' : (pedido.pago_qr ? 'QR' : 'EFECTIVO')) 
          });
        }
      } catch (error) {
        console.error("Error auto-finalizando mesas al cambiar turno:", error);
      }

      const res = await cambiarTurno(nuevoTurno);
      if (res.success) {
        setNotifications(prev => [
          {
            id: Date.now(),
            text: `Turno cambiado a ${nuevoTurno} exitosamente.`,
            time: new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
            read: false
          },
          ...prev
        ]);
      } else {
        showToast(res.error || 'Error al cambiar turno', 'error');
      }
    }
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
      label: 'Gestión de pedidos', 
      icon: Receipt, 
      path: '/cajero/facturacion',
      badge: null 
    },
    { 
      id: 'reportes', 
      label: 'Mi Reporte', 
      icon: FileText, 
      path: '/cajero/reportes',
      badge: null 
    },
    { 
      id: 'perfil', 
      label: 'Mi Perfil', 
      icon: User, 
      path: '/cajero/perfil',
      badge: null 
    },
  ]

  const navbarActions = [
    {
      icon: turno === 'AM' ? Sun : Moon,
      label: `Cambiar Turno (Actual: ${turno})`,
      onClick: handleCambiarTurno
    },
    {
      icon: Clock,
      label: 'Hora',
      text: currentTime.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
      onClick: () => {}
    }
  ]

  const userMenuItems = [
    {
      label: 'Mi Perfil',
      icon: User,
      onClick: () => navigate('/cajero/perfil')
    },
    {
      label: 'Mi Turno',
      icon: Clock,
      text: `${turno} - ${user?.nombre}`,
      onClick: handleCambiarTurno
    },
    {
      label: 'Cerrar Turno',
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
        userRole="cajero"
        onLogout={handleLogoutClick}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          user={user}
          actions={navbarActions}
          userMenuItems={userMenuItems}
          notifications={notifications}
          setNotifications={setNotifications}
          title={`Cajero: ${user?.nombre}`}
          subtitle={`Turno ${turno}`}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-4 right-4 z-[9999] animate-bounce">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 backdrop-blur-md text-white font-semibold ${
            toast.type === 'success' ? 'bg-green-600/95' : 'bg-red-600/95'
          }`}>
            {toast.type === 'success' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  )
}

export default CajeroLayout