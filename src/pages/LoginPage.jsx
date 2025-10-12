import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { User, Shield, ChefHat, Clock, Eye, EyeOff, LogIn, UserCheck } from 'lucide-react'
import useAuthStore from '../store/authStore'
import Modal from '../components/common/Modal'

function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loginAdmin, loginCajero, loginError, clearError } = useAuthStore()

  // Modal inline + rol activo
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
    setShowLoginModal(true)
    clearError()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const closeLoginModal = () => {
    setShowLoginModal(false)
    clearError()
    setShowPassword(false)
  }

  const switchRole = (role) => {
    setActiveRole(role)
    clearError()
    if (role === 'ADMIN') setAdminForm({ email: '', password: '' })
    if (role === 'CAJERO') setCajeroForm({ nombre: '', turno: 'AM' })
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    clearError()
    const result = await loginAdmin(adminForm.email, adminForm.password)
    if (result.success) navigate('/admin/dashboard')
    setIsLoading(false)
  }

  const handleCajeroLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    clearError()
    const result = await loginCajero(cajeroForm.nombre, cajeroForm.turno)
    if (result.success) navigate('/cajero/pedidos')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Modal inline dentro del contenedor */}
        <Modal
          isOpen={showLoginModal}
          onClose={closeLoginModal}
          title={<>BIENVENIDO A <br /> ATAVISMO</>}
          subtitle={<>INGRESE SUS <br /> CREDENCIALES PARA INGRESAR</>}
          maxWidth="max-w-lg"
          variant="inline"
          showClose={false}
          titleClass="text-center text-[var(--guindo-color)] uppercase tracking-wide"
          subtitleClass="text-center text-gray-500 text-[var(--negro-color)]"
        >
          {/* Selector de rol */}
          <div className="flex gap-2 mb-5 bg-[var(--guindoClaro-color)] p-2 rounded-lg">
            <button
              type="button"
              onClick={() => switchRole('ADMIN')}
              className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold ${
                activeRole === 'ADMIN'
                  ? 'bg-[var(--blanco-color)] text-[var(--guindo-color)] shadow-sm'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <Shield size={18} /> Administrador
            </button>
            <button
              type="button"
              onClick={() => switchRole('CAJERO')}
              className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold ${
                activeRole === 'CAJERO'
                  ? 'bg-[var(--blanco-color)] text-[var(--guindo-color)] shadow-sm'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <User size={18} /> Cajero
            </button>
          </div>

          {/* Contenido variable */}
          {activeRole === 'ADMIN' ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="input"
                  placeholder="admin@restaurant.com"
                  required
                  autoFocus
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
                    className="input pr-10"
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
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {loginError}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full flex items-center justify-center gap-2 bg-[var(--negro-azul)] border-0"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <LogIn size={20} />
                      Ingresar
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2 border-t">
                <p className="text-xs text-gray-500 mt-2">
                  Credenciales de prueba: admin@restaurant.com / admin123
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCajeroLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-1" />
                  Nombre del Cajero
                </label>
                <input
                  type="text"
                  value={cajeroForm.nombre}
                  onChange={(e) => setCajeroForm({ ...cajeroForm, nombre: e.target.value })}
                  className="input"
                  placeholder="Ej: Juan Pérez"
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este nombre aparecerá en los pedidos y reportes
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Clock size={16} className="inline mr-1" />
                  Seleccione su Turno
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCajeroForm({ ...cajeroForm, turno: 'AM' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      cajeroForm.turno === 'AM'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">☀️</div>
                    <div className="font-semibold">Turno Mañana</div>
                    <div className="text-sm opacity-75">7:00 AM - 3:00 PM</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCajeroForm({ ...cajeroForm, turno: 'PM' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      cajeroForm.turno === 'PM'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">🌙</div>
                    <div className="font-semibold">Turno Tarde</div>
                    <div className="text-sm opacity-75">3:00 PM - 11:00 PM</div>
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {loginError}
                </div>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading || !cajeroForm.nombre.trim()}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <UserCheck size={20} />
                      Iniciar Turno
                    </>
                  )}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">ℹ️ Nota:</span> No se requiere contraseña.
                  Todas las acciones quedarán registradas con su nombre para el reporte diario.
                </p>
              </div>
            </form>
          )}
        </Modal>

        {/* Footer */}
        <p className="text-[--negro-color] text-xs mt-6">© 2024 Restaurant POS - v1.0.0</p>
      </div>
    </div>
  )
}

export default LoginPage
