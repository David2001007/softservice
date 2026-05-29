import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { deleteTecnico } from '@/features/tecnicos/server'
import { formatPhone } from '@/lib/utils'

export function VerTecnicoPage({ tecnico, id }: { tecnico: any; id: string }) {
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!tecnico) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteTecnico({ data: Number(id) })
      toast.success('Técnico excluído com sucesso!')
      navigate({ to: '/tecnicos' })
    } catch {
      toast.error('Erro ao excluir técnico')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const details = {
    Código: tecnico.codigo,
    Nome: tecnico.nome,
    Tipo: tecnico.tipo === 'interno' ? 'Interno' : 'Terceiro',
    Empresa: tecnico.empresa,
    CNPJ: tecnico.cnpj,
    Telefone: formatPhone(tecnico.telefone),
    'E-mail': tecnico.email,
    Região: tecnico.regiao,
    Especialidade: tecnico.especialidade,
    Perfil: tecnico.perfil,
    Usuário: tecnico.username,
    Status: tecnico.ativo ? 'Ativo' : 'Inativo',
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Técnico #${id}`}
        action={
          <div className="flex gap-2">
            <DefaultButton
              variant="ghost"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              label="Voltar"
              onClick={() => navigate({ to: '/tecnicos' })}
            />
            <DefaultButton
              variant="outline"
              leftIcon={<Trash2 className="w-4 h-4" />}
              label="Excluir"
              className="text-danger border-danger/20 hover:bg-danger/10"
              onClick={() => setShowDeleteModal(true)}
            />
            <Link to="/tecnicos/$id/editar" params={{ id }}>
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
        title="Excluir Técnico"
        description={`Tem certeza que deseja excluir o técnico "${tecnico.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
