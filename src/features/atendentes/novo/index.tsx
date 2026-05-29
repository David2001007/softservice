import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import {
  atendenteSchema
  
} from '@/features/atendentes/schema'
import type {AtendenteInput} from '@/features/atendentes/schema';
import { createAtendente } from '@/features/atendentes/server'

const inputCls =
  'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const selectCls = `${inputCls} cursor-pointer`

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}

export function NovoAtendentePage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AtendenteInput>({
    resolver: zodResolver(atendenteSchema),
    defaultValues: { role: 'atendente' },
  })

  const onSubmit = async (data: AtendenteInput) => {
    try {
      await createAtendente({ data })
      toast.success('Atendente cadastrado com sucesso!')
      await navigate({ to: '/atendentes' })
    } catch (e) {
      toast.error('Erro ao cadastrar atendente')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 fade-in">
      <PageHeader
        title="Cadastro de Atendente"
        action={
          <DefaultButton
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            label="Voltar"
            onClick={() => navigate({ to: '/atendentes' })}
          />
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">
            Dados Pessoais
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field
                label="Nome Completo"
                required
                error={errors.nome?.message}
              >
                <input
                  {...register('nome')}
                  placeholder="Nome do atendente"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="CPF" required error={errors.cpf?.message}>
              <input
                {...register('cpf')}
                placeholder="000.000.000-00"
                className={inputCls}
              />
            </Field>
            <Field label="E-mail" required error={errors.email?.message}>
              <input
                {...register('email')}
                type="email"
                placeholder="email@empresa.com"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">
            Acesso ao Sistema
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Usuário" required error={errors.username?.message}>
              <input
                {...register('username')}
                placeholder="usuario.login"
                className={inputCls}
              />
            </Field>
            <Field label="Perfil">
              <select {...register('role')} className={selectCls}>
                <option value="atendente">Atendente</option>
                <option value="admin">Administrador</option>
              </select>
            </Field>
            <Field label="Senha" required error={errors.password?.message}>
              <input
                {...register('password', {
                  required: 'Senha é obrigatória para novos cadastros',
                })}
                type="password"
                placeholder="Mínimo 6 caracteres"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <DefaultButton
            variant="ghost"
            label="Cancelar"
            onClick={() => navigate({ to: '/atendentes' })}
          />
          <DefaultButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Salvando..."
            leftIcon={<Save className="w-4 h-4" />}
            label="Salvar Atendente"
            className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
          />
        </div>
      </form>
    </div>
  )
}
