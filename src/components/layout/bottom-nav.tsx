import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/ordens-servico', label: 'OS', icon: ClipboardList },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/materiais', label: 'Estoque', icon: Package },
]

export function BottomNav() {
  const { location } = useRouterState()

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to
    return location.pathname.startsWith(to)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-[72px] bg-surface border-t border-border flex items-center justify-around px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      {navItems.map((item) => {
        const active = isActive(item.to, item.exact)
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full gap-1 text-text-muted transition-colors',
              active && 'text-primary',
            )}
          >
            <div
              className={cn(
                'p-1.5 rounded-xl transition-all',
                active && 'bg-primary/10',
              )}
            >
              <item.icon
                className={cn('w-5 h-5', active && 'text-primary')}
              />
            </div>
            <span
              className={cn('text-[10px] font-medium', active && 'font-bold')}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
