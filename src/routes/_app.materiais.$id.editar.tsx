import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { materialSchema, type MaterialInput } from '@/features/materiais/schema'
import { getMaterial, updateMaterial } from '@/features/materiais/server'

export const Route = createFileRoute('/_app/materiais/$id/editar')({
  loader: async ({ params }) => await getMaterial({ data: Number(params.id) }),
  component: EditarMaterialPage,
})

const inputCls = 'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const selectCls = `${inputCls} cursor-pointer`

function EditarMaterialPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/_app/materiais/$id/editar' })
  const material = Route.useLoaderData()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MaterialInput>({
    resolver: zodResolver(materialSchema),
    defaultValues: material ? {
      descricao: material.descricao,
      categoria: material.categoria,
      unidade: material.unidade as any,
      quantidade: String(material.quantidade),
      estoqueMinimo: String(material.estoqueMinimo),
      comodato: material.comodato,
      status: material.status as any,
    } : {},
  })

  const onSubmit = async (data: MaterialInput) => {
    try {
      await updateMaterial({ data: { id: Number(id), data } })
      toast.success('Material atualizado!')
      await navigate({ to: '/materiais' })
    } catch (e) {
      toast.error('Erro ao atualizar material')
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-5 fade-in">
      <PageHeader title={`Editar Material #${id}`} action={<DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/materiais' })} />} />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-text">Descrição<span className="text-danger ml-1">*</span></label>
            <input {...register('descricao')} className={inputCls} />
            {errors.descricao && <p className="text-xs text-danger">{errors.descricao.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Categoria<span className="text-danger ml-1">*</span></label>
            <input {...register('categoria')} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Unidade<span className="text-danger ml-1">*</span></label>
            <select {...register('unidade')} className={selectCls}>
              <option value="unidade">Unidade</option><option value="metro">Metro</option><option value="rolo">Rolo</option><option value="par">Par</option><option value="caixa">Caixa</option><option value="kit">Kit</option>
            </select>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text">Quantidade</label><input {...register('quantidade')} type="number" step="0.001" className={inputCls} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text">Est. Mínimo</label><input {...register('estoqueMinimo')} type="number" step="0.001" className={inputCls} /></div>
          <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
            <input {...register('comodato')} id="comodato-edit" type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" />
            <label htmlFor="comodato-edit" className="text-sm text-text cursor-pointer">Material de comodato</label>
          </div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text">Status</label><select {...register('status')} className={selectCls}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <DefaultButton variant="ghost" label="Cancelar" onClick={() => navigate({ to: '/materiais' })} />
          <DefaultButton type="submit" isLoading={isSubmitting} leftIcon={<Save className="w-4 h-4" />} label="Salvar Alterações" className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20" />
        </div>
      </form>
    </div>
  )
}
