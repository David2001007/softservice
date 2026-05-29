import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { tecnicoSchema  } from '@/features/tecnicos/schema'
import type {TecnicoInput} from '@/features/tecnicos/schema';
import { updateTecnico, deleteTecnico } from '@/features/tecnicos/server'

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
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
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

export function EditarTecnicoPage({
  tecnico,
  id,
}: {
  tecnico: any
  id: string
}) {
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TecnicoInput>({
    resolver: zodResolver(tecnicoSchema),
    values: tecnico
      ? {
          nome: tecnico.nome,
          tipo: tecnico.tipo,
          telefone: tecnico.telefone,
          email: tecnico.email || '',
          empresa: tecnico.empresa || '',
          cnpj: tecnico.cnpj || '',
          regiao: tecnico.regiao || '',
          especialidade: tecnico.especialidade || '',
          perfil: tecnico.perfil,
          username: tecnico.username,
          ativo: tecnico.ativo,
        }
      : undefined,
  })

  const tipo = watch('tipo')

  const onSubmit = async (data: TecnicoInput) => {
    try {
      await updateTecnico({ data: { id: Number(id), data } })
      toast.success('Técnico atualizado com sucesso!')
      await navigate({ to: '/tecnicos' })
    } catch (e) {
      toast.error('Erro ao atualizar técnico')
    }
  }

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

  if (!tecnico) return null

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Editar Técnico #${id}`}
        action={
          <DefaultButton
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            label="Voltar"
            onClick={() => navigate({ to: '/tecnicos' })}
          />
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection title="Dados Principais">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome" required error={errors.nome?.message}>
              <input
                {...register('nome')}
                placeholder="Nome completo"
                className={inputCls}
              />
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
                  <input
                    {...register('empresa')}
                    placeholder="Razão social"
                    className={inputCls}
                  />
                </Field>
                <Field label="CNPJ" error={errors.cnpj?.message}>
                  <input
                    {...register('cnpj')}
                    placeholder="00.000.000/0001-00"
                    className={inputCls}
                  />
                </Field>
              </>
            )}

            <Field label="Telefone" required error={errors.telefone?.message}>
              <input
                {...register('telefone')}
                placeholder="(44) 99999-0000"
                className={inputCls}
              />
            </Field>
            <Field label="E-mail" error={errors.email?.message}>
              <input
                {...register('email')}
                type="email"
                placeholder="email@exemplo.com"
                className={inputCls}
              />
            </Field>
            <Field label="Região de Atendimento">
              <input
                {...register('regiao')}
                placeholder="Ex: Maringá Norte, Sarandi..."
                className={inputCls}
              />
            </Field>
            <Field label="Especialidade / Preferência">
              <input
                {...register('especialidade')}
                placeholder="Instalação, Manutenção, Infra..."
                className={inputCls}
              />
            </Field>
            <Field label="Perfil">
              <select {...register('perfil')} className={selectCls}>
                <option value="tecnico">Técnico</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </Field>
            <Field label="Situação">
              <select
                className={selectCls}
                {...register('ativo', {
                  setValueAs: (v) => v === 'true' || v === true,
                })}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
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
        </FormSection>

        <div className="flex items-center justify-between pt-2">
          <DefaultButton
            variant="outline"
            leftIcon={<Trash2 className="w-4 h-4" />}
            label="Excluir Técnico"
            className="text-danger border-danger/20 hover:bg-danger/10"
            onClick={() => setShowDeleteModal(true)}
          />
          <div className="flex items-center gap-3">
            <DefaultButton
              variant="ghost"
              label="Cancelar"
              onClick={() => navigate({ to: '/tecnicos' })}
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
        title="Excluir Técnico"
        description={`Tem certeza que deseja excluir o técnico "${tecnico.nome}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
