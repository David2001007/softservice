import { StatusBadge } from '@/components/status-badge'
import { DefaultButton } from '@/components/default-button'
import { Calendar, MapPin, Phone, Eye, Settings2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useNavigate } from '@tanstack/react-router'

interface OrdemServicoCardProps {
  os: any
}

export function OrdemServicoCard({ os }: OrdemServicoCardProps) {
  const navigate = useNavigate()
  
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3">
      {/* Header: Number and Status */}
      <div className="flex justify-between items-start">
        <div>
          <span className="font-mono text-lg font-bold text-yellow-600">{os.numero}</span>
          <h3 className="text-sm font-semibold mt-1">{os.cliente?.nome || 'Sem cliente'}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge value={os.status || ''} type="os" />
          <StatusBadge value={os.prioridade || ''} type="prioridade" />
        </div>
      </div>

      <hr className="border-border/50" />

      {/* Details */}
      <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 shrink-0" />
          <span className="truncate">{os.tipoServico}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>
            {os.dataAgendada
              ? formatDate(new Date(os.dataAgendada), { time: true })
              : 'Sem agendamento'}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="line-clamp-2">
            {os.cliente?.logradouro} {os.cliente?.numero ? `, ${os.cliente.numero}` : ''} - {os.cliente?.cidade}
          </span>
        </div>
        {os.cliente?.telefone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 shrink-0" />
            <span>{os.cliente.telefone}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2 pt-3 border-t border-border/50">
        <DefaultButton
          variant="outline"
          className="flex-1 text-xs h-9"
          leftIcon={<Eye className="w-3.5 h-3.5" />}
          label="Ver"
          onClick={() => navigate({ to: `/ordens-servico/${os.id}` })}
        />
        <DefaultButton
          className="flex-1 text-xs h-9 bg-primary hover:bg-primary-hover text-white"
          leftIcon={<Settings2 className="w-3.5 h-3.5" />}
          label="Gerenciar"
          onClick={() => navigate({ to: `/ordens-servico/${os.id}/gerenciar` })}
        />
      </div>
    </div>
  )
}
