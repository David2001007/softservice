import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Pencil, Settings2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { AccordionFilters } from '@/components/accordion-filters'
import { DefaultTable, type Column } from '@/components/default-table'
import { DefaultButton } from '@/components/default-button'
import { StatusBadge } from '@/components/status-badge'
import { formatDate } from '@/lib/utils'

import { getOrdensServico } from '@/features/ordens-servico/server'

export const Route = createFileRoute('/_app/ordens-servico/')({
  loader: async () => await getOrdensServico(),
  component: OrdensServicoPage,
})



const tipoServicoLabel: Record<string, string> = {
  instalacao: 'Instalação',
  manutencao: 'Manutenção',
  troca_equipamento: 'Troca de Equip.',
  infra: 'Infra',
  outro: 'Outro',
}

const columns: Column<any>[] = [
  { header: 'Nº OS', cell: (r) => <span className="font-mono text-gold text-xs font-semibold">{r.numero}</span> },
  { header: 'Abertura', cell: (r) => <span className="text-sm text-text-muted">{formatDate(new Date(r.dataAbertura))}</span> },
  { header: 'Cliente', cell: (r) => r.cliente?.nome || '-' },
  { header: 'Cidade', cell: (r) => r.cliente?.cidade || '-', className: 'text-text-muted text-sm' },
  { header: 'Tipo', cell: (r) => <span className="text-sm">{tipoServicoLabel[r.tipoServico] ?? r.tipoServico}</span> },
  { header: 'Técnico', cell: (r) => r.tecnico?.nome || '-', className: 'text-text-muted text-sm' },
  { header: 'Agendada', cell: (r) => <span className="text-sm text-text-muted whitespace-nowrap">{r.dataAgendada ? formatDate(new Date(r.dataAgendada), { time: true }) : '—'}</span> },
  { header: 'Status', cell: (r) => <StatusBadge value={r.status} type="os" /> },
  {
    header: 'Ações',
    cell: (r) => (
      <div className="flex items-center gap-1">
        <Link to="/ordens-servico/$id/gerenciar" params={{ id: String(r.id) }}>
          <DefaultButton size="sm" leftIcon={<Settings2 className="w-3.5 h-3.5" />} label="Gerenciar" className="h-7 text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20" />
        </Link>
        <Link to="/ordens-servico/$id/editar" params={{ id: String(r.id) }}>
          <DefaultButton size="sm" variant="ghost" leftIcon={<Pencil className="w-3.5 h-3.5" />} className="h-7 text-xs" />
        </Link>
      </div>
    ),
  },
]

function OrdensServicoPage() {
  const ordens = Route.useLoaderData()
  const [filtros, setFiltros] = useState({ numero: '', cliente: '', tecnico: '', status: '', tipoServico: '' })
  const [page, setPage] = useState(1)

  const filtered = ordens.filter((o: any) =>
    (!filtros.numero || o.numero.toLowerCase().includes(filtros.numero.toLowerCase())) &&
    (!filtros.cliente || o.cliente?.nome.toLowerCase().includes(filtros.cliente.toLowerCase())) &&
    (!filtros.tecnico || o.tecnico?.nome.toLowerCase().includes(filtros.tecnico.toLowerCase())) &&
    (!filtros.status || o.status === filtros.status) &&
    (!filtros.tipoServico || o.tipoServico === filtros.tipoServico)
  )

  return (
    <div className="space-y-5 fade-in">
      <PageHeader
        title="Lista de Ordens de Serviço"
        subtitle="Gerenciamento de todas as OS"
        action={
          <Link to="/ordens-servico/nova">
            <DefaultButton label="Nova OS" leftIcon={<Plus className="w-4 h-4" />} className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20" />
          </Link>
        }
      />

      <AccordionFilters>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Nº OS</label>
            <input value={filtros.numero} onChange={(e) => setFiltros((f) => ({ ...f, numero: e.target.value }))} placeholder="OS-001..." className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Cliente</label>
            <input value={filtros.cliente} onChange={(e) => setFiltros((f) => ({ ...f, cliente: e.target.value }))} placeholder="Nome do cliente..." className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Técnico</label>
            <input value={filtros.tecnico} onChange={(e) => setFiltros((f) => ({ ...f, tecnico: e.target.value }))} placeholder="Nome do técnico..." className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Status</label>
            <select value={filtros.status} onChange={(e) => setFiltros((f) => ({ ...f, status: e.target.value }))} className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm focus:outline-none focus:border-primary transition-colors">
              <option value="">Todos</option>
              <option value="aberta">Aberta</option>
              <option value="agendada">Agendada</option>
              <option value="em_execucao">Em Execução</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
              <option value="reagendada">Reagendada</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Tipo de Serviço</label>
            <select value={filtros.tipoServico} onChange={(e) => setFiltros((f) => ({ ...f, tipoServico: e.target.value }))} className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm focus:outline-none focus:border-primary transition-colors">
              <option value="">Todos</option>
              <option value="instalacao">Instalação</option>
              <option value="manutencao">Manutenção</option>
              <option value="troca_equipamento">Troca de Equipamento</option>
              <option value="infra">Infra</option>
              <option value="outro">Outro</option>
            </select>
          </div>
        </div>
      </AccordionFilters>

      <DefaultTable
        columns={columns}
        data={filtered.slice((page - 1) * 10, page * 10)}
        emptyMessage="Nenhuma ordem de serviço encontrada"
        pagination={{ currentPage: page, totalPages: Math.ceil(filtered.length / 10), totalItems: filtered.length, onPageChange: setPage }}
      />
    </div>
  )
}
