import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Eye, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { AccordionFilters } from '@/components/accordion-filters'
import { DefaultTable, type Column } from '@/components/default-table'
import { DefaultButton } from '@/components/default-button'
import { StatusBadge } from '@/components/status-badge'
import { formatPhone } from '@/lib/utils'

import { getTecnicos } from '@/features/tecnicos/server'

export const Route = createFileRoute('/_app/tecnicos/')({
  loader: async () => await getTecnicos(),
  component: TecnicosPage,
})





const columns: Column<any>[] = [
  { header: 'Código', accessorKey: 'codigo', className: 'font-mono text-gold text-xs' },
  { header: 'Nome', accessorKey: 'nome' },
  {
    header: 'Tipo',
    cell: (r) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${r.tipo === 'interno' ? 'bg-info/15 text-info border-info/30' : 'bg-gold/15 text-gold border-gold/30'}`}>
        {r.tipo === 'interno' ? 'Interno' : 'Terceiro'}
      </span>
    ),
  },
  { header: 'Empresa', accessorKey: 'empresa', className: 'text-text-muted text-sm' },
  { header: 'Telefone', cell: (r) => formatPhone(r.telefone) },
  { header: 'Região', accessorKey: 'regiao', className: 'text-sm text-text-muted' },
  { header: 'Status', cell: (r) => <StatusBadge value={r.status} type="cliente" /> },
  {
    header: 'Ações',
    cell: (r) => (
      <div className="flex items-center gap-1">
        <Link to="/tecnicos/$id" params={{ id: String(r.id) }}>
          <DefaultButton size="sm" variant="ghost" leftIcon={<Eye className="w-3.5 h-3.5" />} label="Ver" className="h-7 text-xs" />
        </Link>
        <Link to="/tecnicos/$id/editar" params={{ id: String(r.id) }}>
          <DefaultButton size="sm" variant="ghost" leftIcon={<Pencil className="w-3.5 h-3.5" />} label="Editar" className="h-7 text-xs" />
        </Link>
      </div>
    ),
  },
]

function TecnicosPage() {
  const tecnicos = Route.useLoaderData()
  const [filtros, setFiltros] = useState({ nome: '', tipo: '', regiao: '', status: '' })
  const [page, setPage] = useState(1)

  const filtered = (tecnicos as any).filter((t: any) =>
    (!filtros.nome || t.nome.toLowerCase().includes(filtros.nome.toLowerCase())) &&
    (!filtros.tipo || t.tipo === filtros.tipo) &&
    (!filtros.regiao || t.regiao.toLowerCase().includes(filtros.regiao.toLowerCase())) &&
    (!filtros.status || t.status === filtros.status)
  )

  return (
    <div className="space-y-5 fade-in">
      <PageHeader
        title="Lista de Técnicos e Terceiros"
        subtitle="Técnicos e prestadores cadastrados"
        action={
          <Link to="/tecnicos/novo">
            <DefaultButton label="Novo Técnico" leftIcon={<Plus className="w-4 h-4" />} className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20" />
          </Link>
        }
      />

      <AccordionFilters>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Nome</label>
            <input value={filtros.nome} onChange={(e) => setFiltros((f) => ({ ...f, nome: e.target.value }))} placeholder="Buscar..." className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Tipo</label>
            <select value={filtros.tipo} onChange={(e) => setFiltros((f) => ({ ...f, tipo: e.target.value }))} className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm focus:outline-none focus:border-primary transition-colors">
              <option value="">Todos</option>
              <option value="interno">Interno</option>
              <option value="terceiro">Terceiro</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Região</label>
            <input value={filtros.regiao} onChange={(e) => setFiltros((f) => ({ ...f, regiao: e.target.value }))} placeholder="Região..." className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Status</label>
            <select value={filtros.status} onChange={(e) => setFiltros((f) => ({ ...f, status: e.target.value }))} className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm focus:outline-none focus:border-primary transition-colors">
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
      </AccordionFilters>

      <DefaultTable
        columns={columns}
        data={filtered.slice((page - 1) * 10, page * 10)}
        emptyMessage="Nenhum técnico encontrado"
        pagination={{ currentPage: page, totalPages: Math.ceil(filtered.length / 10), totalItems: filtered.length, onPageChange: setPage, itemsPerPage: 10 }}
      />
    </div>
  )
}
