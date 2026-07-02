import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { formatDate } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuthStore } from '@/stores/auth.store'
import { useState, useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'

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

// ─── Label map ────────────────────────────────────────────────────────────────
const tipoServicoLabel: Record<string, string> = {
  instalacao: 'Instalação',
  manutencao: 'Manutenção',
  troca_equipamento: 'Troca Equipamento',
  infra: 'Infraestrutura',
  outro: 'Outro',
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: any[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        padding: '8px 14px',
        fontSize: 12,
        color: 'var(--color-text)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
      }}
    >
      {label && (
        <p style={{ marginBottom: 4, color: 'var(--color-text-muted)', fontWeight: 600 }}>
          {label}
        </p>
      )}
      {payload.map((entry: any) => (
        <div key={entry.name}>
          <p style={{ margin: '2px 0' }}>
            <span style={{ color: entry.color, marginRight: 6 }}>●</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{entry.name}: </span>
            <strong style={{ color: 'var(--color-text)' }}>{entry.value}</strong>
          </p>
        </div>
      ))}
    </div>
  )
}

function CustomPieTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: any[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
        padding: '8px 14px',
        fontSize: 12,
        color: 'var(--color-text)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
      }}
    >
      <p style={{ margin: 0 }}>
        <span style={{ color: item.payload.fill, marginRight: 6 }}>●</span>
        <strong style={{ color: 'var(--color-text)' }}>{item.name}</strong>
      </p>
      <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)' }}>
        {item.value} OS{' '}
        <span style={{ color: 'var(--color-text)' }}>
          ({((item.value / item.payload.total) * 100).toFixed(1)}%)
        </span>
      </p>
    </div>
  )
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ ordens }: { ordens: any[] }) {
  const navigate = useNavigate()
  const [selectedTecnicos, setSelectedTecnicos] = useState<number[]>([])
  const [periodoDias, setPeriodoDias] = useState<number>(30)

  const filteredOrdens = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - periodoDias)
    
    return ordens.filter((o) => {
      // Regra de Ouro: Trabalho pendente NUNCA desaparece por causa do tempo.
      const isPendente = !['concluida', 'cancelada'].includes(o.status)
      if (isPendente) return true
      
      // O filtro de tempo (ex: 30 dias) aplica-se apenas para o histórico concluído
      return new Date(o.dataAbertura || o.createdAt) >= cutoff
    })
  }, [ordens, periodoDias])

  const abertas = filteredOrdens.filter((o) => o.status === 'aberta').length
  const emExecucao = filteredOrdens.filter((o) => o.status === 'em_execucao').length
  const concluidas = filteredOrdens.filter(
    (o) => o.status === 'concluida'
  ).length
  const atrasadas = filteredOrdens.filter(
    (o) =>
      (o.status === 'agendada' || o.status === 'reagendada') &&
      o.dataAgendada &&
      new Date(o.dataAgendada) < new Date(),
  ).length
  const agendadasFuturas = filteredOrdens.filter(
    (o) => (o.status === 'agendada' || o.status === 'reagendada') && new Date(o.dataAgendada) >= new Date(),
  ).length

  const cards = [
    {
      label: 'Aguardando Agendamento',
      value: abertas,
      icon: ClipboardList,
      color: 'text-info',
      bg: 'bg-info/10',
      border: 'border-info/20',
      statusQuery: 'aberta'
    },
    {
      label: 'Em Execução',
      value: emExecucao,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/20',
      statusQuery: 'em_execucao'
    },
    {
      label: 'Concluídas',
      value: concluidas,
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/20',
      statusQuery: 'concluida'
    },
    {
      label: 'Atrasadas',
      value: atrasadas,
      icon: AlertTriangle,
      color: 'text-danger',
      bg: 'bg-danger/10',
      border: 'border-danger/20',
      statusQuery: 'atrasada'
    },
    {
      label: 'OS Agendadas',
      value: agendadasFuturas,
      icon: CalendarClock,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      statusQuery: 'agendada,reagendada'
    },
  ]

  // ── Chart data: tipo de serviço ──────────────────────────────────────────
  const tiposCount: Record<string, number> = {}
  for (const o of filteredOrdens) {
    if (o.tipoServico) {
      tiposCount[o.tipoServico] = (tiposCount[o.tipoServico] ?? 0) + 1
    }
  }
  const totalTipos = Object.values(tiposCount).reduce((a, b) => a + b, 0)
  const TIPO_COLORS = [
    '#7c6af7', // primary / purple
    '#3abff8', // info / cyan
    '#36d399', // success / green
    '#fbbd23', // warning / yellow
    '#f87272', // danger / red
  ]
  const tiposData = Object.entries(tiposCount).map(([key, value], i) => ({
    name: tipoServicoLabel[key] ?? key,
    value,
    fill: TIPO_COLORS[i % TIPO_COLORS.length],
    total: totalTipos,
  }))

  // ── Chart data: OS por técnico ───────────────────────────────────────────
  const todosTecnicos = useMemo(() => {
    const map = new Map<number, string>()
    for (const o of filteredOrdens) {
      if (o.tecnico?.id && o.tecnico?.nome) {
        map.set(o.tecnico.id, o.tecnico.nome)
      }
    }
    return Array.from(map.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [filteredOrdens])

  const tecnicoData = useMemo(() => {
    const map: Record<number, { id: number; name: string; abertas: number; concluidas: number; emExecucao: number }> = {}
    
    for (const o of filteredOrdens) {
      if (!o.tecnico?.id) continue
      
      if (selectedTecnicos.length > 0 && !selectedTecnicos.includes(o.tecnico.id)) {
        continue
      }

      const tId = o.tecnico.id
      const name = o.tecnico.nome ? o.tecnico.nome.split(' ')[0] : 'Desconhecido'

      if (!map[tId]) {
        map[tId] = { id: tId, name, abertas: 0, concluidas: 0, emExecucao: 0 }
      }

      if (o.status === 'aberta' || o.status === 'agendada' || o.status === 'reagendada' || o.status === 'pendente') {
        map[tId].abertas++
      } else if (o.status === 'em_execucao') {
        map[tId].emExecucao++
      } else if (o.status === 'concluida') {
        map[tId].concluidas++
      }
    }

    return Object.values(map)
      .sort((a, b) => b.abertas + b.concluidas - (a.abertas + a.concluidas))
  }, [filteredOrdens, selectedTecnicos])

  // ── Próximos atendimentos ────────────────────────────────────────────────
  const hojeStr = new Date().toISOString().split('T')[0]
  const proximosAtendimentos = filteredOrdens
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Visão geral das ordens de serviço —{' '}
            {format(new Date(), "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex flex-col gap-1 sm:items-end">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-muted">Período:</span>
            <select
              className="bg-surface border border-border text-sm rounded-lg px-3 py-1.5 text-text focus:border-primary focus:outline-none shadow-sm cursor-pointer"
              value={periodoDias}
              onChange={(e) => setPeriodoDias(Number(e.target.value))}
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={15}>Últimos 15 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={90}>Últimos 3 meses</option>
              <option value={180}>Últimos 6 meses</option>
              <option value={365}>Último 1 ano</option>
            </select>
          </div>
          <p className="text-[10px] text-text-muted/70 italic sm:text-right">
            * O filtro aplica-se à data de criação das ordens
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-5 gap-4 overflow-x-auto pt-2 pb-2">
        {cards.map((card) => (
          <div
            key={card.label}
            onClick={() => navigate({ to: '/ordens-servico', search: { status: card.statusQuery } })}
            className={`cursor-pointer bg-surface border ${card.border} rounded-xl p-3 flex items-center gap-2 shadow-soft hover:border-opacity-50 transition-all hover:-translate-y-1`}
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

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Donut – Tipo de Serviço */}
        <div className="bg-surface border border-border rounded-xl shadow-soft overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <PieChartIcon className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-text text-sm">OS por Tipo de Serviço</h2>
            <span className="ml-auto text-xs bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
              {totalTipos} total
            </span>
          </div>

          {tiposData.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-sm text-text-muted">
              Sem dados para exibir
            </div>
          ) : (
            <div className="flex items-center gap-4 px-5 py-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={tiposData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {tiposData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {tiposData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 min-w-0">
                    <span
                      className="shrink-0 w-2.5 h-2.5 rounded-full"
                      style={{ background: item.fill }}
                    />
                    <span className="text-xs text-text-muted truncate">{item.name}</span>
                    <span className="ml-auto text-xs font-semibold text-text shrink-0">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bar – OS por Técnico */}
        <div className="bg-surface border border-border rounded-xl shadow-soft overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border flex-wrap">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-text text-sm">Carga de OS por Técnico</h2>
            
            <div className="ml-auto flex items-center gap-2">
              <select
                className="bg-background border border-border text-xs rounded-md px-2 py-1 text-text-muted focus:border-primary focus:outline-none"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'all') {
                    setSelectedTecnicos([])
                  } else {
                    const id = Number(val)
                    if (!selectedTecnicos.includes(id)) {
                      setSelectedTecnicos([...selectedTecnicos, id])
                    }
                  }
                }}
                value="all"
              >
                <option value="all">Filtrar técnico...</option>
                {todosTecnicos.filter(t => !selectedTecnicos.includes(t.id)).map(t => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>

              <span className="text-xs bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium shrink-0">
                {tecnicoData.length} técnicos
              </span>
            </div>
          </div>

          {selectedTecnicos.length > 0 && (
            <div className="px-5 py-2 border-b border-border bg-background/20 flex flex-wrap gap-2 items-center">
              <button 
                onClick={() => setSelectedTecnicos([])}
                className="text-[10px] text-text-muted hover:text-text transition-colors"
              >
                Limpar filtros
              </button>
              {selectedTecnicos.map(id => {
                const tec = todosTecnicos.find(t => t.id === id)
                return (
                  <span key={id} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded flex items-center gap-1 border border-primary/20">
                    {tec?.nome?.split(' ')[0]}
                    <button 
                      onClick={() => setSelectedTecnicos(prev => prev.filter(p => p !== id))}
                      className="hover:text-danger ml-1"
                    >
                      ×
                    </button>
                  </span>
                )
              })}
            </div>
          )}

          {tecnicoData.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-sm text-text-muted">
              Nenhum técnico com OS atribuídas
            </div>
          ) : (
            <div className="px-2 pt-4 pb-2 overflow-x-auto styled-scrollbar">
              <div style={{ minWidth: `${Math.max(100, tecnicoData.length * 10)}%` }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={tecnicoData}
                    margin={{ top: 0, right: 16, left: -20, bottom: 0 }}
                  barSize={14}
                  barGap={3}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: 'var(--color-text-muted)', paddingTop: 8 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar dataKey="abertas" name="Fila de Trabalho" fill="#7c6af7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="emExecucao" name="Em Execução" fill="#fbbd23" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="concluidas" name="Concluídas" fill="#36d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
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
              {proximosAtendimentos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-text-muted">
                    Nenhum atendimento agendado para hoje.
                  </td>
                </tr>
              ) : (
                proximosAtendimentos.map((os, i) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
