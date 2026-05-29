import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { formatDate } from '@/lib/utils'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { getOrdensServico } from '@/features/ordens-servico/server'

export const Route = createFileRoute('/_app/agenda/')({
  loader: async () => await getOrdensServico(),
  component: AgendaPage,
})

const statusColors: Record<string, string> = {
  aberta: 'bg-info/20 border-info/40 text-info',
  agendada: 'bg-primary/20 border-primary/40 text-primary',
  em_execucao: 'bg-warning/20 border-warning/40 text-warning',
  concluida: 'bg-success/20 border-success/40 text-success',
  cancelada: 'bg-danger/20 border-danger/40 text-danger',
  pendente: 'bg-text-muted/20 border-text-muted/40 text-text-muted',
  reagendada: 'bg-gold/20 border-gold/40 text-gold',
}

function AgendaPage() {
  const ordens = Route.useLoaderData()
  const eventos = ordens
    .filter((o) => o.dataAgendada)
    .map((o) => ({
      id: o.id,
      osId: o.id,
      numero: o.numero,
      cliente: o.cliente?.nome || 'N/A',
      tecnico: o.tecnico?.nome || 'Não atribuído',
      tipoServico: o.tipoServico,
      dataAgendada: new Date(o.dataAgendada as any),
      status: o.status,
    }))

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date())
  const [filtroTecnico, setFiltroTecnico] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { locale: ptBR })
  const calEnd = endOfWeek(monthEnd, { locale: ptBR })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const filteredEventos = eventos.filter(
    (e) =>
      (!filtroTecnico ||
        e.tecnico.toLowerCase().includes(filtroTecnico.toLowerCase())) &&
      (!filtroTipo ||
        e.tipoServico.toLowerCase().includes(filtroTipo.toLowerCase())) &&
      (!filtroStatus || e.status === filtroStatus),
  )

  const getEventosForDay = (day: Date) =>
    filteredEventos.filter((e) => isSameDay(e.dataAgendada, day))

  const selectedDayEventos = selectedDay ? getEventosForDay(selectedDay) : []

  return (
    <div className="space-y-5 fade-in">
      <PageHeader
        title="Agenda de Atendimentos"
        subtitle="Visualize e gerencie os atendimentos agendados"
      />

      {/* Filtros */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">
              Técnico
            </label>
            <input
              value={filtroTecnico}
              onChange={(e) => setFiltroTecnico(e.target.value)}
              placeholder="Filtrar por técnico..."
              className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">
              Tipo de Serviço
            </label>
            <input
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              placeholder="Instalação, Manutenção..."
              className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-muted">
              Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="">Todos</option>
              <option value="aberta">Aberta</option>
              <option value="agendada">Agendada</option>
              <option value="em_execucao">Em Execução</option>
              <option value="concluida">Concluída</option>
              <option value="reagendada">Reagendada</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Calendário */}
        <div className="xl:col-span-2 bg-surface border border-border rounded-xl overflow-hidden">
          {/* Nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold text-text capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
              <div
                key={d}
                className="py-2 text-center text-xs font-semibold text-text-muted"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const evs = getEventosForDay(day)
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = selectedDay && isSameDay(day, selectedDay)
              const isToday = isSameDay(day, new Date())

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[80px] p-2 border-b border-r border-border/50 text-left transition-colors hover:bg-surface-hover ${
                    !isCurrentMonth ? 'opacity-30' : ''
                  } ${isSelected ? 'bg-primary/10' : ''}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mb-1 ${
                      isToday ? 'bg-primary text-white' : 'text-text'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {evs.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded border truncate leading-tight font-medium ${statusColors[ev.status] ?? 'bg-muted border-border text-text-muted'}`}
                      >
                        {ev.numero}
                      </div>
                    ))}
                    {evs.length > 2 && (
                      <div className="text-[10px] text-text-muted pl-1">
                        +{evs.length - 2} mais
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Painel do dia */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-text">
              {selectedDay
                ? format(selectedDay, "dd 'de' MMMM", { locale: ptBR })
                : 'Selecione um dia'}
            </h3>
            <span className="ml-auto text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium border border-primary/20">
              {selectedDayEventos.length} OS
            </span>
          </div>

          <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
            {selectedDayEventos.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">
                Nenhum atendimento agendado para este dia.
              </p>
            ) : (
              selectedDayEventos.map((ev) => (
                <Link
                  key={ev.id}
                  to="/ordens-servico/$id/gerenciar"
                  params={{ id: String(ev.osId) }}
                >
                  <div className="p-3 rounded-xl bg-background border border-border hover:border-primary/40 transition-colors cursor-pointer space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gold">
                        {ev.numero}
                      </span>
                      <StatusBadge value={ev.status} type="os" />
                    </div>
                    <p className="text-sm font-medium text-text">
                      {ev.cliente}
                    </p>
                    <p className="text-xs text-text-muted">{ev.tipoServico}</p>
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>{ev.tecnico}</span>
                      <span className="font-semibold text-text">
                        {
                          formatDate(ev.dataAgendada, { time: true }).split(
                            ' ',
                          )[1]
                        }
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
