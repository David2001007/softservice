import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { logout } from '@/features/auth/server'

export interface AuthUser {
  id: number
  nome: string
  username: string
  role: 'admin' | 'atendente' | 'supervisor' | 'tecnico'
  type: 'user' | 'tecnico'
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  setUser: (user: AuthUser) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => {
        set({ user: null, isAuthenticated: false })
        logout().catch(console.error)
      },
    }),
    { name: 'unite-auth' },
  ),
)
