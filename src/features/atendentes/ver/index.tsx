import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { deleteAtendente } from '@/features/atendentes/server'
import { formatCPFCNPJ } from '@/lib/utils'

export function VerAtendentePage({
  atendente,
  id,
}: {
  atendente: any
  id: string
}) {
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!atendente) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteAtendente({ data: Number(id) })
      toast.success('Usuário excluído com sucesso!')
      navigate({ to: '/atendentes' })
    } catch {
      toast.error('Erro ao excluir usuário')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const details = {
    Código: atendente.codigo,
    Nome: atendente.nome,
    CPF: formatCPFCNPJ(atendente.cpf ?? ''),
    'E-mail': atendente.email,
    Usuário: atendente.username,
    Perfil: atendente.role === 'admin' ? 'Administrador' : 'Atendente',
    Status: atendente.ativo ? 'Ativo' : 'Inativo',
  }

  return (
    <div className="max-w-xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Usuário #${id}`}
        action={
          <div className="flex gap-2">
            <DefaultButton
              variant="ghost"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              label="Voltar"
              onClick={() => navigate({ to: '/atendentes' })}
            />
            <DefaultButton
              variant="outline"
              leftIcon={<Trash2 className="w-4 h-4" />}
              label="Excluir"
              className="text-danger border-danger/20 hover:bg-danger/10"
              onClick={() => setShowDeleteModal(true)}
            />
            <Link to="/atendentes/$id/editar" params={{ id }}>
              <DefaultButton
                label="Editar"
                leftIcon={<Pencil className="w-4 h-4" />}
                className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
              />
            </Link>
          </div>
        }
      />
      <div className="bg-surface border border-border rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {Object.entries(details).map(([k, v]) => (
          <div key={k}>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
              {k}
            </p>
            <p className="text-sm text-text mt-0.5">{v || '-'}</p>
          </div>
        ))}
      </div>

      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir Usuário"
        description={`Tem certeza que deseja excluir o usuário "${atendente.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
