import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { AccordionFilters } from '@/components/accordion-filters'
import { DefaultTable  } from '@/components/default-table'
import type {Column} from '@/components/default-table';
import { DefaultButton } from '@/components/default-button'
import { StatusBadge } from '@/components/status-badge'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { formatPhone } from '@/lib/utils'
import { deleteTecnico } from '@/features/tecnicos/server'

export function TecnicosPage({ tecnicos }: { tecnicos: any[] }) {
  const router = useRouter()
  const [filtros, setFiltros] = useState({
    nome: '',
    tipo: '',
    regiao: '',
    ativo: '',
  })
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number
    nome: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteTecnico({ data: deleteTarget.id })
      toast.success(`Técnico "${deleteTarget.nome}" excluído com sucesso!`)
      setDeleteTarget(null)
      router.invalidate()
    } catch {
      toast.error('Erro ao excluir técnico')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<any>[] = [
    {
      header: 'Código',
      accessorKey: 'codigo',
      className: 'font-mono text-gold text-xs',
    },
    { header: 'Nome', accessorKey: 'nome' },
    {
      header: 'Tipo',
      cell: (r) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${r.tipo === 'interno' ? 'bg-info/15 text-info border-info/30' : 'bg-gold/15 text-gold border-gold/30'}`}
        >
          {r.tipo === 'interno' ? 'Interno' : 'Terceiro'}
        </span>
      ),
    },
    {
      header: 'Empresa',
      accessorKey: 'empresa',
      className: 'text-text-muted text-sm',
    },
    { header: 'Telefone', cell: (r) => formatPhone(r.telefone) },
    {
      header: 'Região',
      accessorKey: 'regiao',
      className: 'text-sm text-text-muted',
    },
    {
      header: 'Status',
      cell: (r) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
            r.ativo
              ? 'bg-success/15 text-success border-success/30'
              : 'bg-danger/15 text-danger border-danger/30'
          }`}
        >
          {r.ativo ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      header: 'Ações',
      cell: (r) => (
        <div className="flex items-center gap-1">
          <Link to="/tecnicos/$id" params={{ id: String(r.id) }}>
            <DefaultButton
              size="sm"
              variant="ghost"
              leftIcon={<Eye className="w-3.5 h-3.5" />}
              label="Ver"
              className="h-7 text-xs"
            />
          </Link>
          <Link to="/tecnicos/$id/editar" params={{ id: String(r.id) }}>
            <DefaultButton
              size="sm"
              variant="ghost"
              leftIcon={<Pencil className="w-3.5 h-3.5" />}
              label="Editar"
              className="h-7 text-xs"
            />
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

  const filtered = (tecnicos as any).filter(
    (t: any) =>
      (!filtros.nome ||
        t.nome.toLowerCase().includes(filtros.nome.toLowerCase())) &&
      (!filtros.tipo || t.tipo === filtros.tipo) &&
      (!filtros.regiao ||
        (t.regiao && t.regiao.toLowerCase().includes(filtros.regiao.toLowerCase()))) &&
      (!filtros.ativo || String(t.ativo) === filtros.ativo),
  )

  return (
    <div className="space-y-5 fade-in">
      <PageHeader
        title="Lista de Técnicos e Terceiros"
        subtitle="Técnicos e prestadores cadastrados"
        action={
          <Link to="/tecnicos/novo">
            <DefaultButton
              label="Novo Técnico"
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
            />
          </Link>
        }
      />

      <AccordionFilters>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Nome</Label>
            <Input
              value={filtros.nome}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, nome: e.target.value }))
              }
              placeholder="Buscar..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Tipo</Label>
            <Select
              value={filtros.tipo || 'todos'}
              onValueChange={(value) =>
                setFiltros((f) => ({
                  ...f,
                  tipo: value === 'todos' ? '' : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="interno">Interno</SelectItem>
                <SelectItem value="terceiro">Terceiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Região</Label>
            <Input
              value={filtros.regiao}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, regiao: e.target.value }))
              }
              placeholder="Região..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Status</Label>
            <Select
              value={filtros.ativo || 'todos'}
              onValueChange={(value) =>
                setFiltros((f) => ({
                  ...f,
                  ativo: value === 'todos' ? '' : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </AccordionFilters>

      <DefaultTable
        columns={columns}
        data={filtered.slice((page - 1) * 10, page * 10)}
        emptyMessage="Nenhum técnico encontrado"
        pagination={{
          currentPage: page,
          totalPages: Math.ceil(filtered.length / 10),
          totalItems: filtered.length,
          onPageChange: setPage,
          itemsPerPage: 10,
        }}
      />

      <DeleteConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir Técnico"
        description={`Tem certeza que deseja excluir o técnico "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
