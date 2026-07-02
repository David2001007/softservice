import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { BottomNav } from './bottom-nav'
import { useUiStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'
import { useEffect, useState } from 'react'

export function AppLayout() {
  const { sidebarCollapsed } = useUiStore()
  const { user, clearUser } = useAuthStore()

  // Aguarda o Zustand hidratar do localStorage antes de renderizar qualquer coisa.
  // Isso evita o flash onde a sidebar aparece por um frame para técnicos.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const handleLogout = () => {
    clearUser()
    toast.success('Logout realizado com sucesso')
    window.location.href = '/login'
  }

  // Enquanto não hidratou, renderiza um placeholder invisível (tela preta)
  if (!hydrated) {
    return <div className="min-h-screen bg-background" />
  }

  const isTecnico = user?.type === 'tecnico'

  return (
    <div className="min-h-screen bg-background">
      {!isTecnico && <Sidebar />}
      <Topbar onLogout={handleLogout} />
      {isTecnico && <BottomNav />}
      <main
        className={cn(
          'pt-[72px] min-h-screen transition-all duration-300',
          !isTecnico && (sidebarCollapsed ? 'pl-16' : 'pl-64'),
          isTecnico && 'pb-[72px]',
        )}
      >
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
