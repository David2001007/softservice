import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { AccordionFilters } from '@/components/accordion-filters'
import { DefaultTable } from '@/components/default-table'
import type { Column } from '@/components/default-table'
import { DefaultButton } from '@/components/default-button'
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
import { deleteAtendente } from '@/features/atendentes/server'
import { formatCPFCNPJ } from '@/lib/utils'

export function AtendentesPage({ atendentes }: { atendentes: any[] }) {
  const router = useRouter()
  const [filtros, setFiltros] = useState({
    nome: '',
    username: '',
    email: '',
    role: '',
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
      await deleteAtendente({ data: deleteTarget.id })
      toast.success(`Usuário "${deleteTarget.nome}" excluído com sucesso!`)
      setDeleteTarget(null)
      router.invalidate()
    } catch {
      toast.error('Erro ao excluir usuário')
    } finally {
      setIsDeleting(false)
    }
  }

  const filtered = atendentes.filter(
    (a: any) =>
      (!filtros.nome ||
        a.nome.toLowerCase().includes(filtros.nome.toLowerCase())) &&
      (!filtros.username ||
        a.username?.toLowerCase().includes(filtros.username.toLowerCase())) &&
      (!filtros.email ||
        a.email?.toLowerCase().includes(filtros.email.toLowerCase())) &&
      (!filtros.role || a.role === filtros.role) &&
      (!filtros.ativo || String(a.ativo) === filtros.ativo),
  )

  const columns: Column<any>[] = [
    {
      header: 'Código',
      accessorKey: 'codigo',
      className: 'font-mono text-gold text-xs',
    },
    { header: 'Nome', accessorKey: 'nome' },
    { header: 'CPF', cell: (r) => formatCPFCNPJ(r.cpf ?? ''), className: 'text-text-muted text-sm' },
    {
      header: 'E-mail',
      accessorKey: 'email',
      className: 'text-text-muted text-sm',
    },
    {
      header: 'Usuário',
      accessorKey: 'username',
      className: 'font-mono text-sm',
    },
    {
      header: 'Perfil',
      cell: (r) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
            r.role === 'admin'
              ? 'bg-gold/15 text-gold border-gold/30'
              : 'bg-info/15 text-info border-info/30'
          }`}
        >
          {r.role === 'admin' ? 'Admin' : 'Atendente'}
        </span>
      ),
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
          <Link to="/atendentes/$id" params={{ id: String(r.id) }}>
            <DefaultButton
              size="sm"
              variant="ghost"
              leftIcon={<Eye className="w-3.5 h-3.5" />}
              label="Ver"
              className="h-7 text-xs"
            />
          </Link>
          <Link to="/atendentes/$id/editar" params={{ id: String(r.id) }}>
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

  return (
    <div className="space-y-5 fade-in">
      <PageHeader
        title="Cadastro de Usuários"
        subtitle="Usuários que criam e gerenciam ordens de serviço"
        action={
          <Link to="/atendentes/novo">
            <DefaultButton
              label="Novo Usuário"
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
            />
          </Link>
        }
      />

      <AccordionFilters>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
          <div className="space-y-2">
            <Label className="text-xs">Nome</Label>
            <Input
              value={filtros.nome}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, nome: e.target.value }))
              }
              placeholder="Nome do usuário..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Usuário</Label>
            <Input
              value={filtros.username}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, username: e.target.value }))
              }
              placeholder="Login do usuário..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">E-mail</Label>
            <Input
              value={filtros.email}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="E-mail..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Perfil</Label>
            <Select
              value={filtros.role || 'todos'}
              onValueChange={(value) =>
                setFiltros((f) => ({
                  ...f,
                  role: value === 'todos' ? '' : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="atendente">Atendente</SelectItem>
              </SelectContent>
            </Select>
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
          <div className="space-y-2">
            <DefaultButton 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setFiltros({
                  nome: '',
                  username: '',
                  email: '',
                  role: '',
                  ativo: '',
                })
              }}
            >
              Limpar Todos
            </DefaultButton>
          </div>
        </div>
      </AccordionFilters>

      <DefaultTable
        columns={columns}
        data={filtered.slice((page - 1) * 10, page * 10)}
        emptyMessage="Nenhum usuário encontrado"
        pagination={{
          currentPage: page,
          totalPages: Math.ceil(filtered.length / 10),
          totalItems: filtered.length,
          onPageChange: setPage,
        }}
      />

      <DeleteConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir Usuário"
        description={`Tem certeza que deseja excluir o usuário "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
