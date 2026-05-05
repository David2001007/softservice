import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { atendenteSchema, type AtendenteInput } from '@/features/atendentes/schema'
import { getAtendente, updateAtendente } from '@/features/atendentes/server'

export const Route = createFileRoute('/_app/atendentes/$id/editar')({
  loader: async ({ params }) => await getAtendente({ data: Number(params.id) }),
  component: EditarAtendentePage,
})

const inputCls = 'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const selectCls = `${inputCls} cursor-pointer`

function EditarAtendentePage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/_app/atendentes/$id/editar' })
  const atendente = Route.useLoaderData()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AtendenteInput>({
    resolver: zodResolver(atendenteSchema),
    defaultValues: atendente ? {
      nome: atendente.nome,
      cpf: atendente.cpf,
      email: atendente.email,
      username: atendente.username,
      role: atendente.role as any,
    } : {},
  })

  const onSubmit = async (data: AtendenteInput) => {
    try {
      await updateAtendente({ data: { id: Number(id), data } })
      toast.success('Atendente atualizado!')
      await navigate({ to: '/atendentes' })
    } catch (e) {
      toast.error('Erro ao atualizar atendente')
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-5 fade-in">
      <PageHeader title={`Editar Atendente #${id}`} action={<DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/atendentes' })} />} />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5"><label className="text-sm font-medium text-text">Nome<span className="text-danger ml-1">*</span></label><input {...register('nome')} className={inputCls} />{errors.nome && <p className="text-xs text-danger">{errors.nome.message}</p>}</div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text">CPF<span className="text-danger ml-1">*</span></label><input {...register('cpf')} className={inputCls} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text">E-mail<span className="text-danger ml-1">*</span></label><input {...register('email')} type="email" className={inputCls} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text">Usuário<span className="text-danger ml-1">*</span></label><input {...register('username')} className={inputCls} /></div>
          <div className="space-y-1.5"><label className="text-sm font-medium text-text">Perfil</label><select {...register('role')} className={selectCls}><option value="atendente">Atendente</option><option value="admin">Administrador</option></select></div>
          <div className="sm:col-span-2 space-y-1.5"><label className="text-sm font-medium text-text">Nova Senha (opcional)</label><input {...register('password')} type="password" placeholder="Deixe em branco para manter" className={inputCls} /></div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <DefaultButton variant="ghost" label="Cancelar" onClick={() => navigate({ to: '/atendentes' })} />
          <DefaultButton type="submit" isLoading={isSubmitting} leftIcon={<Save className="w-4 h-4" />} label="Salvar Alterações" className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20" />
        </div>
      </form>
    </div>
  )
}
