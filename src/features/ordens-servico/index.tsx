import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { Plus, Settings, Eye, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { AccordionFilters } from '@/components/accordion-filters'
import { DefaultTable, type Column } from '@/components/default-table'
import { DefaultButton } from '@/components/default-button'
import { StatusBadge } from '@/components/status-badge'
import { formatCPFCNPJ } from '@/lib/utils'

export function OrdensServicoPage({ ordens }: { ordens: any[] }) {
  const router = useRouter()
  const [filtros, setFiltros] = useState({ cliente: '', tipo: '', status: '', prioridade: '' })
  const [page, setPage] = useState(1)

  const columns: Column<any>[] = [
    { header: 'OS', accessorKey: 'numero', className: 'font-mono text-gold text-xs' },
    {
      header: 'Cliente / Endereço',
      cell: (r) => (
        <div className="flex flex-col">
          <span className="font-medium text-text">{typeof r.cliente === 'object' ? r.cliente?.nome : r.cliente}</span>
          <span className="text-xs text-text-muted mt-0.5">{r.endereco || (typeof r.cliente === 'object' ? `${r.cliente?.logradouro || ''}, ${r.cliente?.numero || ''}` : '')}</span>
        </div>
      ),
    },
    {
      header: 'Tipo',
      cell: (r) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-hover border border-border">
          {r.tipoServico === 'instalacao' ? 'Instalação' : r.tipoServico === 'manutencao' ? 'Manutenção' : r.tipoServico === 'troca_equipamento' ? 'Troca de Equip' : r.tipoServico === 'infra' ? 'Infraestrutura' : 'Outro'}
        </span>
      ),
    },
    {
      header: 'Prioridade',
      cell: (r) => {
        const colors = {
          baixa: 'text-success',
          media: 'text-warning',
          alta: 'text-danger font-medium',
        }
        return (
          <span className={`flex items-center gap-1.5 text-xs ${colors[r.prioridade as keyof typeof colors]}`}>
            {r.prioridade === 'alta' && <AlertTriangle className="w-3 h-3" />}
            {r.prioridade === 'alta' ? 'Alta' : r.prioridade === 'media' ? 'Média' : 'Baixa'}
          </span>
        )
      },
    },
    { header: 'Status', cell: (r) => <StatusBadge value={r.status} type="os" /> },
    { header: 'Abertura', cell: (r) => r.dataAbertura ? new Date(r.dataAbertura).toLocaleDateString('pt-BR') : '-', className: 'text-xs text-text-muted' },
    {
      header: 'Ações',
      cell: (r) => (
        <div className="flex items-center gap-1">
          <Link to="/ordens-servico/$id/gerenciar" params={{ id: String(r.id) }}>
            <DefaultButton size="sm" variant="ghost" leftIcon={<Settings className="w-3.5 h-3.5" />} label="Gerenciar" className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10" />
          </Link>
          <Link to="/ordens-servico/$id" params={{ id: String(r.id) }}>
            <DefaultButton size="sm" variant="ghost" leftIcon={<Eye className="w-3.5 h-3.5" />} label="Ver" className="h-7 text-xs" />
          </Link>
        </div>
      ),
    },
  ]

  const filtered = ordens.filter((o) => {
    const nomeCliente = typeof o.cliente === 'object' ? o.cliente?.nome || '' : o.cliente || ''
    const cpfCnpj = o.cpfCnpj || (typeof o.cliente === 'object' ? o.cliente?.cpfCnpj : '') || ''
    
    return (!filtros.tipo || nomeCliente.toLowerCase().includes(filtros.tipo.toLowerCase()) || cpfCnpj.includes(filtros.tipo)) &&
    (!filtros.tipoServico || o.tipoServico === filtros.tipoServico) &&
    (!filtros.status || o.status === filtros.status) &&
    (!filtros.prioridade || o.prioridade === filtros.prioridade)
  })

  return (
    <div className="space-y-5 fade-in">
      <PageHeader
        title="Ordens de Serviço"
        subtitle="Gerenciamento de instalações, manutenções e retiradas"
        action={
          <Link to="/ordens-servico/nova">
            <DefaultButton label="Nova OS" leftIcon={<Plus className="w-4 h-4" />} className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20" />
          </Link>
        }
      />

      {/* KPI Cards (Static for now, just visual) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Abertas', value: ordens.filter(o => o.status === 'aberta').length, color: 'text-info' },
          { label: 'Em Andamento', value: ordens.filter(o => o.status === 'em_andamento').length, color: 'text-warning' },
          { label: 'Atrasadas', value: 0, color: 'text-danger' },
          { label: 'Concluídas (Hoje)', value: ordens.filter(o => o.status === 'concluida').length, color: 'text-success' },
        ].map((kpi, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">{kpi.label}</span>
            <span className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</span>
          </div>
        ))}
      </div>

      <AccordionFilters>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Cliente / CPF</label>
            <input value={filtros.cliente} onChange={(e) => setFiltros((f) => ({ ...f, cliente: e.target.value }))} placeholder="Nome, CPF ou Razão..." className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Tipo</label>
            <select value={filtros.tipoServico || ''} onChange={(e) => setFiltros((f) => ({ ...f, tipoServico: e.target.value }))} className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm focus:outline-none focus:border-primary transition-colors">
              <option value="">Todos</option>
              <option value="instalacao">Instalação</option>
              <option value="manutencao">Manutenção</option>
              <option value="troca_equipamento">Troca de Equip</option>
              <option value="infra">Infra</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Status</label>
            <select value={filtros.status} onChange={(e) => setFiltros((f) => ({ ...f, status: e.target.value }))} className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm focus:outline-none focus:border-primary transition-colors">
              <option value="">Todos</option>
              <option value="aberta">Aberta</option>
              <option value="agendada">Agendada</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Prioridade</label>
            <select value={filtros.prioridade} onChange={(e) => setFiltros((f) => ({ ...f, prioridade: e.target.value }))} className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm focus:outline-none focus:border-primary transition-colors">
              <option value="">Todas</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>
      </AccordionFilters>

      <DefaultTable
        columns={columns}
        data={filtered.slice((page - 1) * 10, page * 10)}
        emptyMessage="Nenhuma ordem de serviço encontrada"
        pagination={{ currentPage: page, totalPages: Math.ceil(filtered.length / 10), totalItems: filtered.length, onPageChange: setPage, itemsPerPage: 10 }}
      />
    </div>
  )
}
