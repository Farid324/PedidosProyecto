// src/store/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      role: null, // 'admin' o 'cajero'
      turno: null, // 'AM' o 'PM' para cajeros
      isAuthenticated: false,
      loginError: null,
      sesionIniciada: null, // timestamp de cuando inició sesión

      // Acciones
      loginAdmin: async (email, password) => {
        try {
          // TODO: Conectar con API real
          // Por ahora credenciales de prueba
          if (email === 'admin@restaurant.com' && password === 'admin123') {
            const adminUser = {
              id: 'admin-' + Date.now(),
              name: 'Administrador',
              email: email,
              role: 'admin'
            }
            
            set({
              user: adminUser,
              role: 'admin',
              turno: null,
              isAuthenticated: true,
              loginError: null,
              sesionIniciada: new Date().toISOString()
            })
            
            return { success: true }
          } else {
            set({ loginError: 'Credenciales incorrectas' })
            return { success: false, error: 'Credenciales incorrectas' }
          }
        } catch (error) {
          set({ loginError: error.message })
          return { success: false, error: error.message }
        }
      },

      loginCajero: async (nombreCajero, turno) => {
        try {
          // Los cajeros solo necesitan nombre y turno
          // No requiere validación de contraseña
          if (!nombreCajero || nombreCajero.trim() === '') {
            set({ loginError: 'Por favor ingrese su nombre' })
            return { success: false, error: 'Nombre requerido' }
          }

          const cajeroUser = {
            id: 'cajero-' + Date.now(),
            name: nombreCajero.trim(),
            role: 'cajero',
            // Guardamos metadata para reportes
            metadata: {
              fechaIngreso: new Date().toISOString(),
              turno: turno,
              dispositivo: navigator.userAgent
            }
          }
          
          set({
            user: cajeroUser,
            role: 'cajero',
            turno: turno,
            isAuthenticated: true,
            loginError: null,
            sesionIniciada: new Date().toISOString()
          })

          // TODO: Registrar en backend el inicio de sesión para reportes
          // await authService.registrarAccesoCajero(cajeroUser)
          
          return { success: true }
        } catch (error) {
          set({ loginError: error.message })
          return { success: false, error: error.message }
        }
      },

      logout: () => {
        const state = get()
        
        // TODO: Registrar en backend el cierre de sesión para reportes
        // if (state.user && state.role === 'cajero') {
        //   await authService.registrarCierreSesion(state.user.id, state.sesionIniciada)
        // }
        
        set({
          user: null,
          role: null,
          turno: null,
          isAuthenticated: false,
          loginError: null,
          sesionIniciada: null
        })
      },

      clearError: () => set({ loginError: null }),

      // Método para obtener info de la sesión actual
      getSessionInfo: () => {
        const state = get()
        return {
          usuario: state.user?.name || 'Sin usuario',
          rol: state.role || 'Sin rol',
          turno: state.turno || 'N/A',
          inicioSesion: state.sesionIniciada || null
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        role: state.role,
        turno: state.turno,
        isAuthenticated: state.isAuthenticated,
        sesionIniciada: state.sesionIniciada
      })
    }
  )
)

export default useAuthStore