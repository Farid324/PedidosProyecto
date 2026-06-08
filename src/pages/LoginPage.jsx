// src/pages/LoginPage.jsx
import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../store/authStore'
import Modal from '../components/common/Modal'
import logoImg from '../assets/images/LogoAtavismo.png'

/* ─── SVG Icons temáticos de restaurante/cocina ─── */
const ChefHatIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 40V50C16 52 18 54 20 54H44C46 54 48 52 48 50V40" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M48 28C48 20 42 14 36 14C34 10 30 8 26 10C22 6 14 8 14 16C10 18 8 22 10 28C12 34 16 38 16 40H48C48 38 52 34 54 28C56 22 54 18 48 28Z" stroke={color} strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
    <line x1="24" y1="44" x2="24" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="32" y1="44" x2="32" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="40" y1="44" x2="40" y2="50" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const CookingPotIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="30" rx="20" ry="6" stroke={color} strokeWidth="2.5" fill="none"/>
    <path d="M12 30V44C12 50 20 56 32 56C44 56 52 50 52 44V30" stroke={color} strokeWidth="2.5" fill="none"/>
    <path d="M8 30H12M52 30H56" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    <path d="M24 14C24 10 28 8 28 8" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M32 16C32 12 36 10 36 10" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M40 14C40 10 44 8 44 8" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
)

const SpoonIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="18" rx="10" ry="12" stroke={color} strokeWidth="2.5" fill="none"/>
    <line x1="32" y1="30" x2="32" y2="58" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

const ForkIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="24" y1="8" x2="24" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="32" y1="8" x2="32" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="40" y1="8" x2="40" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 28C22 32 26 34 32 34C38 34 42 32 42 28" stroke={color} strokeWidth="2.5" fill="none"/>
    <line x1="32" y1="34" x2="32" y2="58" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

const KnifeIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 8C30 8 26 20 26 32C26 36 28 38 32 38" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <line x1="32" y1="8" x2="32" y2="38" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="32" y1="38" x2="32" y2="58" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="32" cy="42" r="2" fill={color}/>
  </svg>
)

const PlateIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="36" rx="26" ry="10" stroke={color} strokeWidth="2.5" fill="none"/>
    <ellipse cx="32" cy="34" rx="18" ry="6" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M6 36C6 40 18 48 32 48C46 48 58 40 58 36" stroke={color} strokeWidth="2.5" fill="none"/>
  </svg>
)

const SteamIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 48C20 40 28 38 28 30C28 22 20 20 20 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M32 48C32 40 40 38 40 30C40 22 32 20 32 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M44 48C44 40 52 38 52 30C52 22 44 20 44 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
  </svg>
)

const FlameIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 6C32 6 18 22 18 38C18 48 24 56 32 56C40 56 46 48 46 38C46 22 32 6 32 6Z" stroke={color} strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
    <path d="M32 28C32 28 26 36 26 42C26 46 28 50 32 50C36 50 38 46 38 42C38 36 32 28 32 28Z" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round"/>
  </svg>
)

const WhiskIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M26 8C26 8 22 18 22 28C22 32 26 34 32 34" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M32 8C32 8 32 18 32 28C32 32 32 34 32 34" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M38 8C38 8 42 18 42 28C42 32 38 34 32 34" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <line x1="32" y1="34" x2="32" y2="58" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

const MiniPotIcon = ({ size = 32, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 28H48V44C48 50 42 56 32 56C22 56 16 50 16 44V28Z" stroke={color} strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
    <path d="M12 28H52" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    <path d="M28 16C30 12 34 12 36 16" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M20 8C22 4 26 4 28 8" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
)

/* ─── Componente de icono flotante ─── */
const iconComponents = [
  ChefHatIcon, CookingPotIcon, SpoonIcon, ForkIcon, KnifeIcon,
  PlateIcon, SteamIcon, FlameIcon, WhiskIcon, MiniPotIcon
]

function FloatingIcon({ Icon, style, size, color }) {
  return (
    <div className="login-floating-icon" style={style}>
      <Icon size={size} color={color} />
    </div>
  )
}

/* ─── Generar iconos con posiciones aleatorias ─── */
function generateFloatingIcons(count = 24) {
  const icons = []
  const baseColor = '#8A1C14' // Color guindo oscuro para mayor visibilidad

  for (let i = 0; i < count; i++) {
    const Icon = iconComponents[i % iconComponents.length]
    const size = 32 + Math.random() * 32 // 32-64px (aún más grandes)
    const opacity = 0.25 + Math.random() * 0.35 // 0.25 - 0.60 (mucho más visibles)
    const left = Math.random() * 100
    const top = Math.random() * 100
    const duration = 12 + Math.random() * 18 // 12-30s (un poco más rápidas)
    const delay = -(Math.random() * 15)
    const rotation = Math.random() * 360
    const animIndex = Math.floor(Math.random() * 4)

    icons.push({
      id: i,
      Icon,
      size,
      color: baseColor,
      style: {
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        opacity,
        transform: `rotate(${rotation}deg)`,
        animationName: `loginFloat${animIndex}`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
        pointerEvents: 'none',
        zIndex: 1
      },
    })
  }
  return icons
}

/* ─── CSS de animaciones (inyectado una vez) ─── */
const floatingStyles = `
@keyframes loginFloat0 {
  0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
  25% { transform: translateY(-30px) translateX(15px) rotate(5deg); }
  50% { transform: translateY(-10px) translateX(-20px) rotate(-3deg); }
  75% { transform: translateY(-40px) translateX(10px) rotate(8deg); }
}
@keyframes loginFloat1 {
  0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
  25% { transform: translateY(20px) translateX(-25px) rotate(-6deg); }
  50% { transform: translateY(-15px) translateX(30px) rotate(4deg); }
  75% { transform: translateY(25px) translateX(-10px) rotate(-8deg); }
}
@keyframes loginFloat2 {
  0%, 100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
  33% { transform: translateX(25px) translateY(-20px) rotate(10deg); }
  66% { transform: translateX(-15px) translateY(15px) rotate(-5deg); }
}
@keyframes loginFloat3 {
  0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
  50% { transform: translateY(-25px) rotate(12deg) scale(1.05); }
}
.login-floating-icon {
  will-change: transform;
  transition: none;
}
`

function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loginAdmin, loginCajero, loginError, clearError } = useAuthStore()

  const [showLoginModal, setShowLoginModal] = useState(true)
  const [activeRole, setActiveRole] = useState('ADMIN')

  // Formularios
  const [adminForm, setAdminForm] = useState({ email: '', password: '' })
  const [cajeroForm, setCajeroForm] = useState({ nombre: '', password: '', turno: 'AM' })

  // UI
  const [showPassword, setShowPassword] = useState(false)
  const [showCajeroPassword, setShowCajeroPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Generar iconos una sola vez
  const floatingIcons = useMemo(() => generateFloatingIcons(22), [])

  useEffect(() => {
    const roleParam = (searchParams.get('role') || '').toLowerCase()
    if (roleParam === 'cajero') setActiveRole('CAJERO')
    if (roleParam === 'admin') setActiveRole('ADMIN')
    clearError()
  }, [])

  const switchRole = (role) => {
    setActiveRole(role)
    clearError()
    if (role === 'ADMIN') setAdminForm({ email: '', password: '' })
    if (role === 'CAJERO') setCajeroForm({ nombre: '', password: '', turno: 'AM' })
    setShowPassword(false)
    setShowCajeroPassword(false)
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await loginAdmin(adminForm.email, adminForm.password)
    setIsLoading(false)
    if (result.success) navigate('/admin/dashboard')
  }

  const handleCajeroLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await loginCajero(cajeroForm.nombre, cajeroForm.password, cajeroForm.turno)
    setIsLoading(false)
    if (result.success) navigate('/cajero/pedidos')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 relative overflow-hidden">
      {/* Estilos de animación */}
      <style>{floatingStyles}</style>

      {/* ─── Iconos flotantes de fondo ─── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {floatingIcons.map(({ id, Icon, size, color, style }) => (
          <FloatingIcon key={id} Icon={Icon} size={size} color={color} style={style} />
        ))}
      </div>

      {/* ─── Contenido principal ─── */}
      <div className="max-w-lg w-full text-center relative z-10">
        
        <Modal
          isOpen={showLoginModal}
          onClose={() => {}} 
          title={<>BIENVENIDO A <br /> ATAVISMO</>}
          subtitle={<>INGRESE SUS <br /> CREDENCIALES PARA INGRESAR</>}
          imageSrc={logoImg}
          imageAlt="Logo Atavismo"
          imageClass="!h-40 !w-40 shadow-xl object-contain mx-auto"
          maxWidth="max-w-lg"
          variant="inline"
          showClose={false}
          titleClass="text-center !text-[var(--guindo-primario)] uppercase tracking-wide text-2xl font-bold"
          subtitleClass="text-center text-[var(--gris-primario)] text-[var(--negro-color)] text-sm"
        >
          {/* Selector de rol */}
          <div className="flex gap-2 mb-5 bg-[var(--guindoClaro-color)] p-2 rounded-lg">
            <button
              type="button"
              onClick={() => switchRole('ADMIN')}
              className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold ${
                activeRole === 'ADMIN'
                  ? 'bg-[var(--guindo-primario)] text-[var(--blanco-primario)] shadow-sm font-bold text-base'
                  : 'border-transparent hover:bg-gray-200 text-base text-gray-600'
              }`}
            >
              Administrador
            </button>
            <button
              type="button"
              onClick={() => switchRole('CAJERO')}
              className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold ${
                activeRole === 'CAJERO'
                  ? 'bg-[var(--guindo-primario)] text-[var(--blanco-primario)] shadow-sm font-bold text-base'
                  : 'border-transparent hover:bg-gray-200 text-base text-gray-600'
              }`}
            >
              Cajero
            </button>
          </div>

          {/* FORMULARIO ADMIN */}
          {activeRole === 'ADMIN' ? (
            <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--guindo-primario)] outline-none"
                  placeholder="admin@restaurant.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--guindo-primario)] outline-none pr-10"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                  {loginError}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[var(--azul-primario)] hover:bg-blue-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex justify-center"
                >
                  {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Ingresar'}
                </button>
              </div>
            </form>
          ) : (
            
            /* FORMULARIO CAJERO */
            <form onSubmit={handleCajeroLogin} className="space-y-5 text-left">
              
              {/* Usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario o Correo
                </label>
                <input
                  type="text"
                  value={cajeroForm.nombre}
                  onChange={(e) => setCajeroForm({ ...cajeroForm, nombre: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--guindo-primario)] outline-none"
                  placeholder="Nombre de usuario o correo"
                  required
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showCajeroPassword ? 'text' : 'password'}
                    value={cajeroForm.password}
                    onChange={(e) => setCajeroForm({ ...cajeroForm, password: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--guindo-primario)] outline-none pr-10"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCajeroPassword(!showCajeroPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCajeroPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Turno */}
              <div>
                <label className="block text-sm font-medium text-[var(--guindo-primario)] mb-2">
                  Seleccione su Turno:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCajeroForm({ ...cajeroForm, turno: 'AM' })}
                    className={`p-4 rounded-lg border transition-all ${
                      cajeroForm.turno === 'AM'
                        ? 'border-[var(--azul-primario)] bg-blue-50 text-[var(--azul-primario)] shadow-md ring-2 ring-blue-200'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">☀️</div>
                    <div className="font-semibold text-sm">Mañana</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCajeroForm({ ...cajeroForm, turno: 'PM' })}
                    className={`p-4 rounded-lg border transition-all ${
                      cajeroForm.turno === 'PM'
                        ? 'border-[var(--azul-primario)] bg-blue-50 text-[var(--azul-primario)] shadow-md ring-2 ring-blue-200'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">🌙</div>
                    <div className="font-semibold text-sm">Tarde</div>
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                  {loginError}
                </div>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading || !cajeroForm.nombre.trim() || !cajeroForm.password.trim()}
                  className="w-full py-3 bg-[var(--azul-primario)] hover:bg-blue-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 flex justify-center"
                >
                  {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Iniciar Turno'}
                </button>
              </div>
            </form>
          )}
        </Modal>

        <p className="text-gray-500 text-xs mt-6">© 2025 Restaurant POS - v1.0.0</p>
      </div>
    </div>
  )
}

export default LoginPage