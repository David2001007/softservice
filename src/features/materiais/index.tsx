import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { Plus, Eye, Pencil, AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { AccordionFilters } from '@/components/accordion-filters'
import { DefaultTable, type Column } from '@/components/default-table'
import { DefaultButton } from '@/components/default-button'
import { StatusBadge } from '@/components/status-badge'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { deleteMaterial } from '@/features/materiais/server'

export function MateriaisPage({ materiais }: { materiais: any[] }) {
  const router = useRouter()
  const [filtros, setFiltros] = useState({ codigo: '', descricao: '', categoria: '', status: '' })
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; descricao: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteMaterial({ data: deleteTarget.id })
      toast.success(`Material "${deleteTarget.descricao}" excluído com sucesso!`)
      setDeleteTarget(null)
      router.invalidate()
    } catch {
      toast.error('Erro ao excluir material')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<any>[] = [
    { header: 'Código', accessorKey: 'codigo', className: 'font-mono text-gold text-xs' },
    { header: 'Descrição', accessorKey: 'descricao' },
    { header: 'Categoria', accessorKey: 'categoria', className: 'text-text-muted text-sm' },
    { header: 'Unidade', accessorKey: 'unidade', className: 'text-text-muted text-sm' },
    {
      header: 'Qtd. Estoque',
      cell: (r) => (
        <span className={`font-semibold ${r.quantidade <= r.estoqueMinimo ? 'text-danger' : 'text-text'}`}>
          {r.quantidade}
          {r.quantidade <= r.estoqueMinimo && (
            <AlertTriangle className="inline w-3.5 h-3.5 ml-1 text-warning" />
          )}
        </span>
      ),
    },
    { header: 'Est. Mínimo', accessorKey: 'estoqueMinimo', className: 'text-text-muted text-sm' },
    { header: 'Status', cell: (r) => <StatusBadge value={r.status} type="cliente" /> },
    {
      header: 'Ações',
      cell: (r) => (
        <div className="flex items-center gap-1">
          <Link to="/materiais/$id" params={{ id: String(r.id) }}>
            <DefaultButton size="sm" variant="ghost" leftIcon={<Eye className="w-3.5 h-3.5" />} label="Ver" className="h-7 text-xs" />
          </Link>
          <Link to="/materiais/$id/editar" params={{ id: String(r.id) }}>
            <DefaultButton size="sm" variant="ghost" leftIcon={<Pencil className="w-3.5 h-3.5" />} label="Editar" className="h-7 text-xs" />
          </Link>
          <DefaultButton
            size="sm"
            variant="ghost"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            label="Excluir"
            className="h-7 text-xs text-danger hover:text-danger hover:bg-danger/10"
            onClick={() => setDeleteTarget({ id: r.id, descricao: r.descricao })}
          />
        </div>
      ),
    },
  ]

  const filtered = materiais.filter((m) =>
    (!filtros.codigo || m.codigo.toLowerCase().includes(filtros.codigo.toLowerCase())) &&
    (!filtros.descricao || m.descricao.toLowerCase().includes(filtros.descricao.toLowerCase())) &&
    (!filtros.categoria || m.categoria.toLowerCase().includes(filtros.categoria.toLowerCase())) &&
    (!filtros.status || m.status === filtros.status)
  )

  return (
    <div className="space-y-5 fade-in">
      <PageHeader
        title="Lista de Materiais / Estoque"
        subtitle="Materiais e equipamentos disponíveis"
        action={
          <Link to="/materiais/novo">
            <DefaultButton label="Novo Material" leftIcon={<Plus className="w-4 h-4" />} className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20" />
          </Link>
        }
      />

      {/* Alert estoque baixo */}
      {materiais.some((m) => Number(m.quantidade) <= Number(m.estoqueMinimo)) && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-warning/10 border border-warning/30 text-warning text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Atenção: há materiais abaixo do estoque mínimo!</span>
        </div>
      )}

      <AccordionFilters>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'codigo', label: 'Código', placeholder: 'MAT-001...' },
            { key: 'descricao', label: 'Descrição', placeholder: 'Buscar...' },
            { key: 'categoria', label: 'Categoria', placeholder: 'Fibra, Equipamento...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted">{label}</label>
              <input value={filtros[key as keyof typeof filtros]} onChange={(e) => setFiltros((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary transition-colors" />
            </div>
          ))}
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
        emptyMessage="Nenhum material encontrado"
        pagination={{ currentPage: page, totalPages: Math.ceil(filtered.length / 10), totalItems: filtered.length, onPageChange: setPage }}
      />

      <DeleteConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir Material"
        description={`Tem certeza que deseja excluir o material "${deleteTarget?.descricao}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
