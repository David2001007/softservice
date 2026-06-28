import {
  ClipboardList,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  PackageX,
  Clock,
} from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { formatDate, formatNumber } from '@/lib/utils'

interface TecnicoDashboardProps {
  ordens: any[]
  materiais: any[]
}

export function TecnicoDashboard({
  ordens,
  materiais,
}: TecnicoDashboardProps) {
  const minhasOrdens = ordens

  const abertas = minhasOrdens.filter((o) => o.status === 'aberta').length
  const agendadas = minhasOrdens.filter((o) => o.status === 'agendada').length
  const emExecucao = minhasOrdens.filter(
    (o) => o.status === 'em_execucao',
  ).length
  const concluidasMes = minhasOrdens.filter(
    (o) =>
      o.status === 'concluida' &&
      new Date(o.updatedAt).getMonth() === new Date().getMonth(),
  ).length
  const atrasadas = minhasOrdens.filter(
    (o) =>
      o.status === 'agendada' &&
      o.dataAgendada &&
      new Date(o.dataAgendada) < new Date(),
  ).length

  // Para o futuro: lógica de estoque do técnico específico
  const estoqueBaixo = materiais.filter(
    (m) => Number(m.quantidade) <= Number(m.estoqueMinimo),
  )

  const cards = [
    {
      label: 'OS Abertas',
      value: abertas + emExecucao,
      icon: ClipboardList,
      color: 'text-info',
      bg: 'bg-info/10',
      border: 'border-info/20',
    },
    {
      label: 'Agendadas',
      value: agendadas,
      icon: CalendarClock,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
    },
    {
      label: 'Atrasadas',
      value: atrasadas,
      icon: AlertTriangle,
      color: 'text-danger',
      bg: 'bg-danger/10',
      border: 'border-danger/20',
    },
    {
      label: 'Concluídas',
      value: concluidasMes,
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/20',
    },
    {
      label: 'Estoque Baixo',
      value: estoqueBaixo.length,
      icon: PackageX,
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/20',
    },
  ]

  const hojeStr = new Date().toISOString().split('T')[0]
  const proximosAtendimentos = minhasOrdens
    .filter(
      (o) =>
        o.dataAgendada &&
        new Date(o.dataAgendada).toISOString().split('T')[0] === hojeStr &&
        o.status !== 'concluida' &&
        o.status !== 'cancelada',
    )
    .sort(
      (a, b) =>
        new Date(a.dataAgendada!).getTime() -
        new Date(b.dataAgendada!).getTime(),
    )

  return (
    <div className="space-y-6 fade-in pb-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text">Meu Dashboard</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Resumo de atividades —{' '}
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: 'long',
          })}
        </p>
      </div>

      {/* Cards - Scroll horizontal no mobile */}
      <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`min-w-[140px] snap-center bg-surface border ${card.border} rounded-2xl p-4 flex flex-col gap-3 shadow-soft`}
          >
            <div
              className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}
            >
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-text leading-none">
                {card.value}
              </p>
              <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted mt-1 truncate">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Próximos atendimentos */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-text text-sm">
            Atendimentos de Hoje
          </h2>
          <span className="ml-auto text-[10px] bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
            {proximosAtendimentos.length}
          </span>
        </div>

        {proximosAtendimentos.length === 0 ? (
          <div className="bg-surface border border-border border-dashed rounded-xl p-6 text-center">
            <p className="text-sm text-text-muted">
              Nenhum atendimento agendado para hoje.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {proximosAtendimentos.map((os) => (
              <div
                key={os.id}
                className="bg-surface border border-border rounded-xl p-4 shadow-soft flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-gold bg-gold/10 px-2 py-1 rounded-md border border-gold/20">
                    {os.numero}
                  </span>
                  <StatusBadge value={os.status} type="os" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">
                    {os.cliente?.nome}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {os.cliente?.logradouro}, {os.cliente?.numero} -{' '}
                    {os.cliente?.bairro}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-primary" />
                    {formatDate(new Date(os.dataAgendada!), { time: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estoque Baixo */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <PackageX className="w-4 h-4 text-warning" />
          <h2 className="font-semibold text-text text-sm">Abaixo do Mínimo</h2>
          <span className="ml-auto text-[10px] bg-warning/15 text-warning border border-warning/20 px-2 py-0.5 rounded-full font-medium">
            {estoqueBaixo.length}
          </span>
        </div>

        {estoqueBaixo.length === 0 ? (
          <div className="bg-surface border border-border border-dashed rounded-xl p-6 text-center">
            <p className="text-sm text-text-muted">Estoque regularizado.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background/40">
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Item
                    </th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Qtd
                    </th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Min
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estoqueBaixo.map((mat) => (
                    <tr
                      key={mat.id}
                      className="border-b border-border/50 hover:bg-surface-hover transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-text">
                          {mat.descricao}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5 font-mono">
                          {mat.codigo}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-bold text-danger">
                          {formatNumber(mat.quantidade)}
                        </span>
                        <span className="text-[10px] text-text-muted ml-1">
                          {mat.unidade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-text-muted">
                          {formatNumber(mat.estoqueMinimo)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
