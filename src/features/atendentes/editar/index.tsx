import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import {
  atendenteSchema
  
} from '@/features/atendentes/schema'
import type {AtendenteInput} from '@/features/atendentes/schema';
import { updateAtendente, deleteAtendente } from '@/features/atendentes/server'

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

function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">
        {title}
      </h3>
      {children}
    </div>
  )
}

export function EditarAtendentePage({
  atendente,
  id,
}: {
  atendente: any
  id: string
}) {
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AtendenteInput>({
    resolver: zodResolver(atendenteSchema),
    values: atendente
      ? {
          nome: atendente.nome,
          cpf: atendente.cpf,
          email: atendente.email,
          username: atendente.username,
          role: atendente.role,
        }
      : undefined,
  })

  const onSubmit = async (data: AtendenteInput) => {
    try {
      await updateAtendente({ data: { id: Number(id), data } })
      toast.success('Atendente atualizado com sucesso!')
      await navigate({ to: '/atendentes' })
    } catch (e) {
      toast.error('Erro ao atualizar atendente')
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteAtendente({ data: Number(id) })
      toast.success('Atendente excluído com sucesso!')
      navigate({ to: '/atendentes' })
    } catch {
      toast.error('Erro ao excluir atendente')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (!atendente) return null

  return (
    <div className="max-w-2xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Editar Atendente #${id}`}
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
        <FormSection title="Dados Pessoais">
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
        </FormSection>

        <FormSection title="Acesso ao Sistema">
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
            <div className="sm:col-span-2">
              <Field
                label="Nova Senha (opcional)"
                error={errors.password?.message}
              >
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Deixe em branco para manter"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
        </FormSection>

        <div className="flex items-center justify-between pt-2">
          <DefaultButton
            variant="outline"
            leftIcon={<Trash2 className="w-4 h-4" />}
            label="Excluir Atendente"
            className="text-danger border-danger/20 hover:bg-danger/10"
            onClick={() => setShowDeleteModal(true)}
          />
          <div className="flex items-center gap-3">
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
        title="Excluir Atendente"
        description={`Tem certeza que deseja excluir o atendente "${atendente.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
