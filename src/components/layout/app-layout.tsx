import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { BottomNav } from './bottom-nav'
import { useUiStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'

export function AppLayout() {
  const { sidebarCollapsed } = useUiStore()
  const { user, clearUser } = useAuthStore()

  const handleLogout = () => {
    clearUser()
    toast.success('Logout realizado com sucesso')
    window.location.href = '/login'
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
