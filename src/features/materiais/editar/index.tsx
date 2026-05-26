import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { materialSchema, type MaterialInput } from '@/features/materiais/schema'
import { updateMaterial, deleteMaterial } from '@/features/materiais/server'

const inputCls = 'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const selectCls = `${inputCls} cursor-pointer`

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">{label}{required && <span className="text-danger ml-1">*</span>}</label>
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      {title && <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">{title}</h3>}
      {children}
    </div>
  )
}

export function EditarMaterialPage({ material, id }: { material: any; id: string }) {
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MaterialInput>({
    resolver: zodResolver(materialSchema),
    values: material ? {
      descricao: material.descricao,
      categoria: material.categoria,
      unidade: material.unidade as any,
      quantidade: String(material.quantidade),
      estoqueMinimo: String(material.estoqueMinimo),
      comodato: material.comodato,
      status: material.status as any,
    } : undefined,
  })

  const onSubmit = async (data: MaterialInput) => {
    try {
      await updateMaterial({ data: { id: Number(id), data } })
      toast.success('Material atualizado com sucesso!')
      await navigate({ to: '/materiais' })
    } catch (e) {
      toast.error('Erro ao atualizar material')
    }
  }

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

  if (!material) return null

  return (
    <div className="max-w-2xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Editar Material #${id}`}
        action={<DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/materiais' })} />}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection title="">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Descrição" required error={errors.descricao?.message}>
                <input {...register('descricao')} placeholder="Ex: Cabo de fibra óptica SC/UPC" className={inputCls} />
              </Field>
            </div>
            <Field label="Categoria" required error={errors.categoria?.message}>
              <input {...register('categoria')} placeholder="Fibra, Equipamento..." className={inputCls} />
            </Field>
            <Field label="Unidade de Medida" required error={errors.unidade?.message}>
              <select {...register('unidade')} className={selectCls}>
                <option value="unidade">Unidade</option>
                <option value="metro">Metro</option>
                <option value="rolo">Rolo</option>
                <option value="par">Par</option>
                <option value="caixa">Caixa</option>
                <option value="kit">Kit</option>
              </select>
            </Field>
            <Field label="Quantidade Atual">
              <input {...register('quantidade')} type="number" step="0.001" className={inputCls} />
            </Field>
            <Field label="Estoque Mínimo">
              <input {...register('estoqueMinimo')} type="number" step="0.001" className={inputCls} />
            </Field>

            <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
              <input {...register('comodato')} id="comodato-edit" type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" />
              <div>
                <label htmlFor="comodato-edit" className="text-sm font-medium text-text cursor-pointer">Material de comodato</label>
                <p className="text-xs text-text-muted">Equipamento fornecido em comodato ao cliente</p>
              </div>
            </div>

            <Field label="Status">
              <select {...register('status')} className={selectCls}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </Field>
          </div>
        </FormSection>

        <div className="flex items-center justify-between pt-2">
          <DefaultButton
            variant="outline"
            leftIcon={<Trash2 className="w-4 h-4" />}
            label="Excluir Material"
            className="text-danger border-danger/20 hover:bg-danger/10"
            onClick={() => setShowDeleteModal(true)}
          />
          <div className="flex items-center gap-3">
            <DefaultButton variant="ghost" label="Cancelar" onClick={() => navigate({ to: '/materiais' })} />
            <DefaultButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Salvando..."
              leftIcon={<Save className="w-4 h-4" />}
              label="Salvar Alterações"
              className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
            />
          </div>
        </div>
      </form>

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
