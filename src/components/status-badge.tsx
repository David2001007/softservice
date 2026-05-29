import { cn } from '@/lib/utils'

type StatusConfig = {
  label: string
  className: string
}

const osStatusMap: Record<string, StatusConfig> = {
  aberta: { label: 'Aberta', className: 'bg-info/15 text-info border-info/30' },
  agendada: {
    label: 'Agendada',
    className: 'bg-primary/15 text-primary border-primary/30',
  },
  em_execucao: {
    label: 'Em Execução',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  concluida: {
    label: 'Concluída',
    className: 'bg-success/15 text-success border-success/30',
  },
  cancelada: {
    label: 'Cancelada',
    className: 'bg-danger/15 text-danger border-danger/30',
  },
  reagendada: {
    label: 'Reagendada',
    className: 'bg-gold/15 text-gold border-gold/30',
  },
  pendente: {
    label: 'Pendente',
    className: 'bg-text-muted/15 text-text-muted border-text-muted/30',
  },
}

const clienteStatusMap: Record<string, StatusConfig> = {
  ativo: {
    label: 'Ativo',
    className: 'bg-success/15 text-success border-success/30',
  },
  inativo: {
    label: 'Inativo',
    className: 'bg-danger/15 text-danger border-danger/30',
  },
}

const contratoMap: Record<string, StatusConfig> = {
  assinado: {
    label: 'Assinado',
    className: 'bg-success/15 text-success border-success/30',
  },
  nao_assinado: {
    label: 'Não Assinado',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
}

const prioridadeMap: Record<string, StatusConfig> = {
  baixa: {
    label: 'Baixa',
    className: 'bg-text-muted/15 text-text-muted border-text-muted/30',
  },
  normal: { label: 'Normal', className: 'bg-info/15 text-info border-info/30' },
  alta: {
    label: 'Alta',
    className: 'bg-danger/15 text-danger border-danger/30',
  },
}

type BadgeType = 'os' | 'cliente' | 'contrato' | 'prioridade'

interface StatusBadgeProps {
  value: string
  type: BadgeType
  className?: string
}

const maps: Record<BadgeType, Record<string, StatusConfig>> = {
  os: osStatusMap,
  cliente: clienteStatusMap,
  contrato: contratoMap,
  prioridade: prioridadeMap,
}

export function StatusBadge({ value, type, className }: StatusBadgeProps) {
  const map = maps[type]
  const config = map[value] ?? {
    label: value,
    className: 'bg-muted text-text-muted border-border',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
