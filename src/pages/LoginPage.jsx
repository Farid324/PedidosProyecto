import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import useAuthStore from '../store/authStore'
import Modal from '../components/common/Modal'
// 1. IMPORTANTE: Importar la imagen para que funcione al compilar
import logoImg from '../assets/images/LogoAtavismo.png'

function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loginAdmin, loginCajero, loginError, clearError } = useAuthStore()

  // Estado del modal y rol
  const [showLoginModal, setShowLoginModal] = useState(true)
  const [activeRole, setActiveRole] = useState('ADMIN')

  // Formularios
  const [adminForm, setAdminForm] = useState({ email: '', password: '' })
  const [cajeroForm, setCajeroForm] = useState({ nombre: '', turno: 'AM' })

  // UI
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const roleParam = (searchParams.get('role') || '').toLowerCase()
    if (roleParam === 'cajero') setActiveRole('CAJERO')
    if (roleParam === 'admin') setActiveRole('ADMIN')
    
    // Limpiar errores al montar
    clearError()
  }, []) // Eliminé dependencias innecesarias para que solo corra al inicio

  const switchRole = (role) => {
    setActiveRole(role)
    clearError()
    // Opcional: limpiar formularios al cambiar
    if (role === 'ADMIN') setAdminForm({ email: '', password: '' })
    if (role === 'CAJERO') setCajeroForm({ nombre: '', turno: 'AM' })
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Aquí se llama a la función del store
    const result = await loginAdmin(adminForm.email, adminForm.password)
    
    setIsLoading(false)
    if (result.success) {
        navigate('/admin/dashboard')
    }
  }

  const handleCajeroLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    const result = await loginCajero(cajeroForm.nombre, cajeroForm.turno)
    
    setIsLoading(false)
    if (result.success) {
        navigate('/cajero/pedidos')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="max-w-lg w-full text-center">
        
        <Modal
          isOpen={showLoginModal}
          // Quitamos onClose para que el usuario no cierre el login por error
          onClose={() => {}} 
          title={<>BIENVENIDO A <br /> ATAVISMO</>}
          subtitle={<>INGRESE SUS <br /> CREDENCIALES PARA INGRESAR</>}
          imageSrc={logoImg} // 2. Usamos la variable importada
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
              <div>
                <label className="block text-sm font-medium text-[var(--guindo-primario)] mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={cajeroForm.nombre}
                  onChange={(e) => setCajeroForm({ ...cajeroForm, nombre: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--guindo-primario)] outline-none"
                  placeholder="Tu nombre"
                  required
                />
              </div>

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
                  disabled={isLoading || !cajeroForm.nombre.trim()}
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