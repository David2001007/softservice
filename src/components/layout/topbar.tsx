import { LogOut, Bell, ChevronDown } from 'lucide-react'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'

interface TopbarProps {
  onLogout?: () => void
}

export function Topbar({ onLogout }: TopbarProps) {
  const { sidebarCollapsed } = useUiStore()
  const { user } = useAuthStore()

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-[72px] bg-surface border-b border-border flex items-center justify-between px-6 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
    >
      {/* Left: breadcrumb / title */}
      <div />

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {user && (
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold shadow-lg shadow-primary/30">
              {getInitials(user.nome)}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-text leading-tight capitalize">{user.nome}</p>
              <p className="text-[10px] text-text-muted leading-tight capitalize">{user.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
