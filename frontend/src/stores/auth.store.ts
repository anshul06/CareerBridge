import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, Role } from '@/types';

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  hasRole: (role: Role) => boolean;
  isStudent: () => boolean;
  isAdmin: () => boolean;
  isRecruiter: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('careerbridge_token', token);
        localStorage.setItem('careerbridge_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('careerbridge_token');
        localStorage.removeItem('careerbridge_user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      hasRole: (role) => get().user?.role === role,
      isStudent: () => get().user?.role === 'STUDENT',
      isAdmin: () => get().user?.role === 'ADMIN',
      isRecruiter: () => get().user?.role === 'RECRUITER',
    }),
    {
      name: 'careerbridge-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
