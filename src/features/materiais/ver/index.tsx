import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { deleteMaterial } from '@/features/materiais/server'

export function VerMaterialPage({
  material,
  id,
}: {
  material: any
  id: string
}) {
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!material) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMaterial({ data: Number(id) })
      toast.success('Material excluído com sucesso!')
      navigate({ to: '/materiais' })
    } catch {
      toast.error('Erro ao excluir material')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const details = {
    Código: material.codigo,
    Descrição: material.descricao,
    Categoria: material.categoria,
    Unidade: material.unidade,
    Quantidade: material.quantidade,
    'Est. Mínimo': material.estoqueMinimo,
    Comodato: material.comodato ? 'Sim' : 'Não',
    Status: material.status,
  }

  return (
    <div className="max-w-xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Material #${id}`}
        action={
          <div className="flex gap-2">
            <DefaultButton
              variant="ghost"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              label="Voltar"
              onClick={() => navigate({ to: '/materiais' })}
            />
            <DefaultButton
              variant="outline"
              leftIcon={<Trash2 className="w-4 h-4" />}
              label="Excluir"
              className="text-danger border-danger/20 hover:bg-danger/10"
              onClick={() => setShowDeleteModal(true)}
            />
            <Link to="/materiais/$id/editar" params={{ id }}>
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
        title="Excluir Material"
        description={`Tem certeza que deseja excluir o material "${material.descricao}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
