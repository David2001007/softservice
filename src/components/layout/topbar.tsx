import { LogOut, Bell, ChevronDown, User, Key } from 'lucide-react'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { ChangePasswordModal } from '@/features/auth/components/ChangePasswordModal'

interface TopbarProps {
  onLogout?: () => void
}

export function Topbar({ onLogout }: TopbarProps) {
  const { sidebarCollapsed } = useUiStore()
  const { user } = useAuthStore()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2.5 cursor-pointer group hover:bg-surface-hover p-1.5 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold shadow-lg shadow-primary/30">
                    {getInitials(user.nome)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-text leading-tight capitalize">{user.nome}</p>
                    <p className="text-[10px] text-text-muted leading-tight capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted group-data-[state=open]:rotate-180 transition-transform" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl bg-surface/95 backdrop-blur-sm border-white/10">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none text-text">{user.nome}</p>
                    <p className="text-xs leading-none text-text-muted">{user.username}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem 
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="cursor-pointer rounded-lg hover:bg-primary/10 hover:text-primary transition-colors py-2"
                >
                  <Key className="mr-2 h-4 w-4" />
                  <span>Alterar Senha</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem 
                  onClick={onLogout}
                  className="cursor-pointer rounded-lg hover:bg-danger/10 hover:text-danger transition-colors py-2 text-danger/80"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair do Sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <ChangePasswordModal 
        open={isChangePasswordOpen} 
        onOpenChange={setIsChangePasswordOpen} 
      />
    </>
  )
}
