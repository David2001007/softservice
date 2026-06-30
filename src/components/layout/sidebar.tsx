import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  Wrench,
  ClipboardList,
  CalendarDays,
  Package,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/tecnicos', label: 'Técnicos', icon: Wrench },
  { to: '/ordens-servico', label: 'Ordens de Serviço', icon: ClipboardList },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/materiais', label: 'Estoque', icon: Package },
  { to: '/atendentes', label: 'Usuários', icon: UserCheck },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
]


export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const { location } = useRouterState()

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to
    return location.pathname.startsWith(to)
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col bg-surface border-r border-border transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border min-h-[72px]">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 shadow-lg border border-white/10 overflow-hidden">
          <img
            src="/logo.webp"
            alt="Unite Logo"
            className="w-full h-full object-cover"
          />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-text leading-tight">Unite</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.filter(item => {
          if (item.to === '/configuracoes') {
            const role = useAuthStore.getState().user?.role
            return role !== 'atendente'
          }
          return true
        }).map((item) => {
          const active = isActive(item.to, item.exact)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'sidebar-link',
                active && 'active',
                sidebarCollapsed && 'justify-center px-0',
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors text-xs font-medium"
          title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
