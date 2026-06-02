// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

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
          }
          
          return response;
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Error de conexión';
          set({ loginError: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      updateUser: (newUserData) => set((state) => ({
        user: { ...state.user, ...newUserData }
      })),

      logout: async () => {
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