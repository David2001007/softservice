import { createFileRoute } from '@tanstack/react-router'
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
} from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'

import { getOrdensServico } from '@/features/ordens-servico/server'
import { getMateriais } from '@/features/materiais/server'
import { TecnicoDashboard } from '@/features/tecnicos/components/TecnicoDashboard'

export const Route = createFileRoute('/_app/dashboard')({
  loader: async () => {
    const [ordens, materiais] = await Promise.all([
      getOrdensServico(),
      getMateriais(),
    ])
    return { ordens, materiais }
  },
  component: Dashboard,
})

function Dashboard() {
  const { ordens, materiais } = Route.useLoaderData()
  const { user } = useAuthStore()

  if (user?.type === 'tecnico') {
    return (
      <TecnicoDashboard
        ordens={ordens}
        materiais={materiais}
      />
    )
  }

  return <AdminDashboard ordens={ordens} />
}

function AdminDashboard({ ordens }: { ordens: any[] }) {
  const abertas = ordens.filter((o) => o.status === 'aberta').length
  const emExecucao = ordens.filter((o) => o.status === 'em_execucao').length
  const concluidasMes = ordens.filter(
    (o) =>
      o.status === 'concluida' &&
      new Date(o.updatedAt).getMonth() === new Date().getMonth(),
  ).length
  const atrasadas = ordens.filter(
    (o) =>
      o.status === 'agendada' &&
      o.dataAgendada &&
      new Date(o.dataAgendada) < new Date(),
  ).length

  const cards = [
    {
      label: 'OS Abertas',
      value: abertas,
      icon: ClipboardList,
      color: 'text-info',
      bg: 'bg-info/10',
      border: 'border-info/20',
    },
    {
      label: 'Em Execução',
      value: emExecucao,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/20',
    },
    {
      label: 'Concluídas (mês)',
      value: concluidasMes,
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/20',
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
      label: 'OS Agendadas',
      value: ordens.filter((o) => o.status === 'agendada' && new Date(o.dataAgendada) >= new Date()).length,
      icon: CalendarClock,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
    },
  ]

  const hojeStr = new Date().toISOString().split('T')[0]
  const proximosAtendimentos = ordens
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
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-sm text-text-muted mt-0.5">
          Visão geral das ordens de serviço —{' '}
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-5 gap-4 overflow-x-auto">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-surface border ${card.border} rounded-xl p-3 flex items-center gap-2 shadow-soft hover:border-opacity-50 transition-all`}
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{card.value}</p>
              <p className="text-xs text-text-muted mt-1">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Próximos atendimentos */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-soft">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <CalendarClock className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-text text-sm">
            Próximos Atendimentos do Dia
          </h2>
          <span className="ml-auto text-xs bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
            {proximosAtendimentos.length} atendimentos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/40">
                {['Nº OS', 'Cliente', 'Técnico', 'Data/Hora', 'Status'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {proximosAtendimentos.map((os, i) => (
                <tr
                  key={os.id}
                  className={`border-b border-border/50 hover:bg-surface-hover transition-colors ${i % 2 === 0 ? '' : 'bg-background/20'}`}
                >
                  <td className="px-5 py-3.5 text-sm font-mono font-medium text-gold">
                    {os.numero}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text">
                    {os.cliente?.nome}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-muted">
                    {os.tecnico?.nome}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-muted whitespace-nowrap">
                    {formatDate(new Date(os.dataAgendada!), { time: true })}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge value={os.status} type="os" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
