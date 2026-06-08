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
  const warnedPendientes = useRef(new Set())

  // Reloj en tiempo real
  const [currentTime, setCurrentTime] = useState(new Date())

  // Configuración de turnos para validar el cambio
  const [configTurnos, setConfigTurnos] = useState({
    turno_manana_salida: '',
    turno_tarde_ingreso: ''
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
        const [tmSalida, ttIngreso] = await Promise.all([
          api.get('/config/turno_manana_salida'),
          api.get('/config/turno_tarde_ingreso')
        ]);
        
        setConfigTurnos({
          turno_manana_salida: tmSalida.data?.data?.valor || '14:00',
          turno_tarde_ingreso: ttIngreso.data?.data?.valor || '14:00'
        });

      } catch(e) {}
    }

    fetchConfig();

    const checkTimeAndPedidos = async () => {
      const now = new Date();
      setCurrentTime(now); // Actualizar reloj en Navbar

      // 1. Revisión de fin de turno
      if (notifyFinTurno && horaSalidaTurno && !warned15Min.current) {
        const [hSalida, mSalida] = horaSalidaTurno.split(':').map(Number);
        const salidaDate = new Date();
        salidaDate.setHours(hSalida, mSalida, 0, 0);

        const diffMs = salidaDate - now;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins <= 5 && diffMins > 0) {
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleCambiarTurno = async () => {
    const nuevoTurno = turno === 'AM' ? 'PM' : 'AM';
    const now = new Date();
    
    // Validar horarios
    let puedeCambiar = false;
    let mensajeError = '';

    if (nuevoTurno === 'PM') {
      // Intentar cambiar a PM. Debe ser >= hora_ingreso de tarde o salida de mañana
      const [hIngreso, mIngreso] = (configTurnos.turno_tarde_ingreso || '14:00').split(':').map(Number);
      const ingresoDate = new Date();
      ingresoDate.setHours(hIngreso, mIngreso, 0, 0);

      if (now >= ingresoDate) {
        puedeCambiar = true;
      } else {
        mensajeError = `Tu turno AM aún no termina. El turno PM inicia a las ${configTurnos.turno_tarde_ingreso}.`;
      }
    } else {
      // Intentar cambiar a AM (poco común en medio del día, asumiendo que empezó otro ciclo)
      puedeCambiar = true; 
    }

    if (!puedeCambiar) {
      alert(mensajeError); // Mostrar como alert simple, o integrarlo con un Toast si estuviera disponible aquí.
      return;
    }

    if (window.confirm(`¿Quieres cambiar de turno ${turno} a turno ${nuevoTurno}?`)) {
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
        alert(res.error || 'Error al cambiar turno');
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
    </div>
  )
}

export default CajeroLayout