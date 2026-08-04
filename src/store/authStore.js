// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      turno: null,
      isAuthenticated: false,
      loginError: null,
      sesionIniciada: null,

      loginAdmin: async (email, password) => {
        try {
          const response = await authService.loginAdmin(email, password);
          
          if (response.success) {
            set({
              user: response.user,
              role: 'admin',
              turno: null,
              isAuthenticated: true,
              loginError: null,
              sesionIniciada: new Date().toISOString()
            });
          }
          
          return response;
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Error de conexión';
          set({ loginError: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Recibe nombre + password + turno
      loginCajero: async (nombre, password, turno) => {
        try {
          const response = await authService.loginCajero(nombre, password, turno);
          
          if (response.success) {
            set({
              user: response.user,
              role: 'cajero',
              turno: turno,
              isAuthenticated: true,
              loginError: null,
              sesionIniciada: new Date().toISOString()
            });
            // Registrar auditoría de login
            try {
              await api.post('/auditoria', {
                usuario_id: response.user.id,
                nombre_usuario: response.user.nombre,
                accion: 'login',
                turno: turno,
                detalles: `Inició sesión desde caja`
              });
            } catch (e) {
              console.error('No se pudo registrar auditoría de login', e);
            }
          }
          
          return response;
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Error de conexión';
          set({ loginError: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      cambiarTurno: async (nuevoTurno) => {
        try {
          const response = await authService.cambiarTurno(nuevoTurno);
          
          if (response.success) {
            const state = get();
            set({
              user: response.user,
              turno: nuevoTurno,
              sesionIniciada: new Date().toISOString()
            });
            // Registrar auditoría
            try {
              if (state.role === 'cajero' && state.user) {
                await api.post('/auditoria', {
                  usuario_id: state.user.id,
                  nombre_usuario: state.user.nombre,
                  accion: 'login',
                  turno: nuevoTurno,
                  detalles: `Cambió al turno ${nuevoTurno}`
                });
              }
            } catch (e) {}
          }
          
          return response;
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Error al cambiar turno';
          return { success: false, error: errorMessage };
        }
      },

      updateUser: (newUserData) => set((state) => ({
        user: { ...state.user, ...newUserData }
      })),

      logout: async () => {
        const state = get();
        // Si era cajero, registramos su logout antes de limpiar el estado
        if (state.role === 'cajero' && state.user) {
          try {
            await api.post('/auditoria', {
              usuario_id: state.user.id,
              nombre_usuario: state.user.nombre,
              accion: 'logout',
              turno: state.turno,
              detalles: `Cerró sesión`
            });
          } catch (e) {
            console.error('No se pudo registrar auditoría de logout', e);
          }
        }

        await authService.logout();
        set({
          user: null,
          role: null,
          turno: null,
          isAuthenticated: false,
          loginError: null,
          sesionIniciada: null
        });
      },

      clearError: () => set({ loginError: null })
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
);

export default useAuthStore;