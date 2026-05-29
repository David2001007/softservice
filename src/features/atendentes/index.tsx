import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { DefaultTable  } from '@/components/default-table'
import type {Column} from '@/components/default-table';
import { DefaultButton } from '@/components/default-button'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { deleteAtendente } from '@/features/atendentes/server'

export function AtendentesPage({ atendentes }: { atendentes: any[] }) {
  const router = useRouter()
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
      toast.success(`Atendente "${deleteTarget.nome}" excluído com sucesso!`)
      setDeleteTarget(null)
      router.invalidate()
    } catch {
      toast.error('Erro ao excluir atendente')
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
    { header: 'CPF', accessorKey: 'cpf', className: 'text-text-muted text-sm' },
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
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${r.role === 'admin' ? 'bg-gold/15 text-gold border-gold/30' : 'bg-info/15 text-info border-info/30'}`}
        >
          {r.role === 'admin' ? 'Admin' : 'Atendente'}
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
        title="Cadastro de Atendentes"
        subtitle="Usuários que criam e gerenciam ordens de serviço"
        action={
          <Link to="/atendentes/novo">
            <DefaultButton
              label="Novo Atendente"
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
            />
          </Link>
        }
      />
      <DefaultTable
        columns={columns}
        data={atendentes}
        emptyMessage="Nenhum atendente cadastrado"
      />

      <DeleteConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir Atendente"
        description={`Tem certeza que deseja excluir o atendente "${deleteTarget?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
