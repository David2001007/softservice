import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { AccordionFilters } from '@/components/accordion-filters'
import { DefaultTable, type Column } from '@/components/default-table'
import { StatusBadge } from '@/components/status-badge'
import { DefaultButton } from '@/components/default-button'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { formatCPFCNPJ, formatPhone } from '@/lib/utils'
import { deleteCliente } from '@/features/clientes/server'

export function ClientesPage({ clientes }: { clientes: any[] }) {
  const router = useRouter()
  const [filtros, setFiltros] = useState({ nome: '', cpfCnpj: '', cidade: '', status: '' })
  const [page, setPage] = useState(1)
  const perPage = 10
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; nome: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteCliente({ data: deleteTarget.id })
      toast.success(`Cliente "${deleteTarget.nome}" excluído com sucesso!`)
      setDeleteTarget(null)
      router.invalidate()
    } catch {
      toast.error('Erro ao excluir cliente')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<any>[] = [
    { header: 'Código', accessorKey: 'codigo', className: 'font-mono text-gold text-xs' },
    { header: 'Nome / Razão Social', accessorKey: 'nome' },
    { header: 'CPF/CNPJ', cell: (r) => formatCPFCNPJ(r.cpfCnpj) },
    { header: 'Telefone', cell: (r) => formatPhone(r.telefone) },
    { header: 'Cidade/UF', cell: (r) => `${r.cidade}/${r.uf}` },
    { header: 'Status', cell: (r) => <StatusBadge value={r.status} type="cliente" /> },
    {
      header: 'Ações',
      cell: (r) => (
        <div className="flex items-center gap-1">
          <Link to="/clientes/$id" params={{ id: String(r.id) }}>
            <DefaultButton size="sm" variant="ghost" leftIcon={<Eye className="w-3.5 h-3.5" />} label="Ver" className="h-7 text-xs" />
          </Link>
          <Link to="/clientes/$id/editar" params={{ id: String(r.id) }}>
            <DefaultButton size="sm" variant="ghost" leftIcon={<Pencil className="w-3.5 h-3.5" />} label="Editar" className="h-7 text-xs" />
          </Link>
          <DefaultButton
            size="sm"
            variant="ghost"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            label="Excluir"
            className="h-7 text-xs text-danger hover:text-danger hover:bg-danger/10"
            onClick={() => setDeleteTarget({ id: r.id, nome: r.nome })}
          />
        </div>
      ),
    },
  ]

  const filtered = clientes.filter((c) => {
    const q = filtros.nome.toLowerCase()
    const cidade = c.cidade || ''
    return (
      (!filtros.nome || c.nome.toLowerCase().includes(q)) &&
      (!filtros.cpfCnpj || c.cpfCnpj.includes(filtros.cpfCnpj)) &&
      (!filtros.cidade || cidade.toLowerCase().includes(filtros.cidade.toLowerCase())) &&
      (!filtros.status || c.status === filtros.status)
    )
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="space-y-5 fade-in">
      <PageHeader
        title="Lista de Clientes"
        subtitle="Clientes cadastrados no sistema"
        action={
          <Link to="/clientes/novo">
            <DefaultButton label="Novo Cliente" leftIcon={<Plus className="w-4 h-4" />} className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20" />
          </Link>
        }
      />

      <AccordionFilters>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'nome', label: 'Nome / Razão Social', placeholder: 'Buscar...' },
            { key: 'cpfCnpj', label: 'CPF / CNPJ', placeholder: '000.000.000-00' },
            { key: 'cidade', label: 'Cidade', placeholder: 'Cidade...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-medium text-text-muted">{label}</label>
              <input
                value={filtros[key as keyof typeof filtros]}
                onChange={(e) => { setFiltros((f) => ({ ...f, [key]: e.target.value })); setPage(1) }}
                placeholder={placeholder}
                className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Status</label>
            <select
              value={filtros.status}
              onChange={(e) => { setFiltros((f) => ({ ...f, status: e.target.value })); setPage(1) }}
              className="w-full h-9 px-3 rounded-lg bg-background border border-border text-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            >
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
      </AccordionFilters>

      <DefaultTable
        columns={columns}
        data={paginated}
        emptyMessage="Nenhum cliente encontrado"
        pagination={{ currentPage: page, totalPages, totalItems: filtered.length, onPageChange: setPage, itemsPerPage: perPage }}
      />

      <DeleteConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
