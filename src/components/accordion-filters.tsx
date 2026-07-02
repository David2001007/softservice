import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionFiltersProps {
  children: React.ReactNode
  title?: string
  className?: string
  defaultOpen?: boolean
}

export function AccordionFilters({
  children,
  title = 'Filtros de Pesquisa',
  className,
  defaultOpen = false,
}: AccordionFiltersProps) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface overflow-hidden',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-text hover:bg-surface-hover transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          {title}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-text-muted transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 pt-2 border-t border-border fade-in">
          {children}
        </div>
      )}
    </div>
  )
}
