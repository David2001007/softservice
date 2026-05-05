import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { useUiStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'

export function AppLayout() {
  const { sidebarCollapsed } = useUiStore()
  const { clearUser } = useAuthStore()

  const handleLogout = () => {
    clearUser()
    toast.success('Logout realizado com sucesso')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar onLogout={handleLogout} />
      <main
        className={cn(
          'pt-[72px] min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
