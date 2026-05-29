import { formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/status-badge'

interface HistoricoItem {
  id: number
  acao: string
  statusAnterior?: string
  statusNovo?: string
  usuario?: { nome: string }
  motivo?: string
  dataHora: Date | string
}

interface HistoricoProps {
  historico: HistoricoItem[]
}

export function Historico({ historico }: HistoricoProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Linha do tempo de todas as movimentações desta OS (somente leitura).
      </p>
      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-px before:bg-border">
        {historico.map((h) => (
          <div key={h.id} className="relative">
            <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
            <div className="bg-muted border border-border rounded-xl p-4 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold">{h.acao}</span>
                {h.statusAnterior && (
                  <>
                    <StatusBadge value={h.statusAnterior} type="os" />
                    <span className="text-muted-foreground text-xs">→</span>
                    <StatusBadge value={h.statusNovo || ''} type="os" />
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{formatDate(new Date(h.dataHora), { time: true })}</span>
                <span>•</span>
                <span>{h.usuario?.nome || 'Sistema'}</span>
                {h.motivo && (
                  <>
                    <span>•</span>
                    <span>{h.motivo}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
