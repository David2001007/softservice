import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { tecnicoSchema, type TecnicoInput } from '@/features/tecnicos/schema'
import { createTecnico } from '@/features/tecnicos/server'

export const Route = createFileRoute('/_app/tecnicos/novo')({
  component: NovoTecnicoPage,
})

const inputCls = 'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const selectCls = `${inputCls} cursor-pointer`

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">{label} {required && <span className="text-danger">*</span>}</label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">{title}</h3>
      {children}
    </div>
  )
}

function NovoTecnicoPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<TecnicoInput>({
    resolver: zodResolver(tecnicoSchema),
    defaultValues: { tipo: 'interno', perfil: 'tecnico', ativo: true },
  })

  const tipo = watch('tipo')

  const onSubmit = async (data: TecnicoInput) => {
    try {
      await createTecnico({ data })
      toast.success('Técnico cadastrado com sucesso!')
      await navigate({ to: '/tecnicos' })
    } catch (e) {
      toast.error('Erro ao cadastrar técnico')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      <PageHeader
        title="Cadastro de Técnico"
        action={<DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/tecnicos' })} />}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection title="Dados Principais">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome" required error={errors.nome?.message}>
              <input {...register('nome')} placeholder="Nome completo" className={inputCls} />
            </Field>
            <Field label="Tipo" required>
              <select {...register('tipo')} className={selectCls}>
                <option value="interno">Interno</option>
                <option value="terceiro">Terceiro</option>
              </select>
            </Field>

            {tipo === 'terceiro' && (
              <>
                <Field label="Empresa" error={errors.empresa?.message}>
                  <input {...register('empresa')} placeholder="Razão social" className={inputCls} />
                </Field>
                <Field label="CNPJ" error={errors.cnpj?.message}>
                  <input {...register('cnpj')} placeholder="00.000.000/0001-00" className={inputCls} />
                </Field>
              </>
            )}

            <Field label="Telefone" required error={errors.telefone?.message}>
              <input {...register('telefone')} placeholder="(44) 99999-0000" className={inputCls} />
            </Field>
            <Field label="E-mail" error={errors.email?.message}>
              <input {...register('email')} type="email" placeholder="email@exemplo.com" className={inputCls} />
            </Field>
            <Field label="Região de Atendimento">
              <input {...register('regiao')} placeholder="Ex: Maringá Norte, Sarandi..." className={inputCls} />
            </Field>
            <Field label="Especialidade / Preferência">
              <input {...register('especialidade')} placeholder="Instalação, Manutenção, Infra..." className={inputCls} />
            </Field>
            <Field label="Perfil">
              <select {...register('perfil')} className={selectCls}>
                <option value="tecnico">Técnico</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </Field>
            <Field label="Situação">
              <select {...register('ativo')} className={selectCls}>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Acesso ao Sistema">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Usuário" required error={errors.username?.message}>
              <input {...register('username')} placeholder="usuario.login" className={inputCls} />
            </Field>
            <Field label="Senha" required error={errors.password?.message}>
              <input {...register('password')} type="password" placeholder="Mínimo 6 caracteres" className={inputCls} />
            </Field>
          </div>
        </FormSection>

        <div className="flex items-center justify-end gap-3 pt-2">
          <DefaultButton variant="ghost" label="Cancelar" onClick={() => navigate({ to: '/tecnicos' })} />
          <DefaultButton type="submit" isLoading={isSubmitting} loadingText="Salvando..." leftIcon={<Save className="w-4 h-4" />} label="Salvar Técnico" className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20" />
        </div>
      </form>
    </div>
  )
}
