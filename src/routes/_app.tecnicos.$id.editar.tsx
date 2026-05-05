import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { tecnicoSchema, type TecnicoInput } from '@/features/tecnicos/schema'
import { getTecnico, updateTecnico } from '@/features/tecnicos/server'

export const Route = createFileRoute('/_app/tecnicos/$id/editar')({
  loader: async ({ params }) => await getTecnico({ data: Number(params.id) }),
  component: EditarTecnicoPage,
})

const inputCls = 'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const selectCls = `${inputCls} cursor-pointer`

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return <div className="space-y-1.5"><label className="block text-sm font-medium text-text">{label}</label>{children}{error && <p className="text-xs text-danger">{error}</p>}</div>
}

function EditarTecnicoPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/_app/tecnicos/$id/editar' })
  const tecnico = Route.useLoaderData()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<TecnicoInput>({
    resolver: zodResolver(tecnicoSchema),
    defaultValues: tecnico ? {
      nome: tecnico.nome,
      tipo: tecnico.tipo as any,
      telefone: tecnico.telefone,
      email: tecnico.email || '',
      empresa: tecnico.empresa || '',
      cnpj: tecnico.cnpj || '',
      regiao: tecnico.regiao || '',
      especialidade: tecnico.especialidade || '',
      perfil: tecnico.perfil as any,
      username: tecnico.username,
      ativo: tecnico.ativo,
    } : {},
  })
  const tipo = watch('tipo')

  const onSubmit = async (data: TecnicoInput) => {
    try {
      await updateTecnico({ data: { id: Number(id), data } })
      toast.success('Técnico atualizado!')
      await navigate({ to: '/tecnicos' })
    } catch (e) {
      toast.error('Erro ao atualizar técnico')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in">
      <PageHeader title={`Editar Técnico #${id}`} action={<DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/tecnicos' })} />} />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome" error={errors.nome?.message}><input {...register('nome')} className={inputCls} /></Field>
          <Field label="Tipo"><select {...register('tipo')} className={selectCls}><option value="interno">Interno</option><option value="terceiro">Terceiro</option></select></Field>
          {tipo === 'terceiro' && <>
            <Field label="Empresa"><input {...register('empresa')} className={inputCls} /></Field>
            <Field label="CNPJ"><input {...register('cnpj')} className={inputCls} /></Field>
          </>}
          <Field label="Telefone" error={errors.telefone?.message}><input {...register('telefone')} className={inputCls} /></Field>
          <Field label="E-mail"><input {...register('email')} type="email" className={inputCls} /></Field>
          <Field label="Região"><input {...register('regiao')} className={inputCls} /></Field>
          <Field label="Especialidade"><input {...register('especialidade')} className={inputCls} /></Field>
          <Field label="Perfil"><select {...register('perfil')} className={selectCls}><option value="tecnico">Técnico</option><option value="supervisor">Supervisor</option></select></Field>
          <Field label="Usuário" error={errors.username?.message}><input {...register('username')} className={inputCls} /></Field>
          <Field label="Nova Senha (opcional)"><input {...register('password')} type="password" placeholder="Deixe em branco para manter" className={inputCls} /></Field>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <DefaultButton variant="ghost" label="Cancelar" onClick={() => navigate({ to: '/tecnicos' })} />
          <DefaultButton type="submit" isLoading={isSubmitting} leftIcon={<Save className="w-4 h-4" />} label="Salvar Alterações" className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20" />
        </div>
      </form>
    </div>
  )
}
