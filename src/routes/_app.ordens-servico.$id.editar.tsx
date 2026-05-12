import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save, Trash2, Settings2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { osSchema, type OsInput } from '@/features/ordens-servico/schema'
import { getOrdemServico, updateOrdemServico, deleteOrdemServico } from '@/features/ordens-servico/server'
import { getClientes } from '@/features/clientes/server'
import { getTecnicos } from '@/features/tecnicos/server'

export const Route = createFileRoute('/_app/ordens-servico/$id/editar')({
  loader: async ({ params }) => {
    const [os, clientes, tecnicos] = await Promise.all([
      getOrdemServico({ data: Number(params.id) }),
      getClientes(),
      getTecnicos()
    ])
    return { os, clientes, tecnicos }
  },
  component: EditarOsPage,
})

const inputCls = 'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const selectCls = `${inputCls} cursor-pointer`
const textareaCls = 'w-full px-3 py-2.5 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none'

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
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider border-b border-border pb-2">{title}</h3>
      {children}
    </div>
  )
}

function EditarOsPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/_app/ordens-servico/$id/editar' })
  const { os, clientes, tecnicos } = Route.useLoaderData()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<OsInput>({
    resolver: zodResolver(osSchema),
    defaultValues: os ? {
      clienteId: os.clienteId,
      tipoServico: os.tipoServico as any,
      descricaoProblema: os.descricaoProblema || '',
      observacoes: os.observacoes || '',
      prioridade: os.prioridade as any,
      dataAgendada: os.dataAgendada ? new Date(os.dataAgendada).toISOString().slice(0, 16) : '',
      tecnicoId: os.tecnicoId || undefined,
      valor: os.valor || '',
      status: os.status as any,
    } : {},
  })

  const clienteId = watch('clienteId')
  const clienteSelecionado = clientes.find((c: any) => c.id === Number(clienteId))

  const onSubmit = async (data: OsInput) => {
    try {
      await updateOrdemServico({ data: { id: Number(id), data } })
      toast.success('Ordem de Serviço atualizada com sucesso!')
      await navigate({ to: '/ordens-servico' })
    } catch (e) {
      toast.error('Erro ao atualizar Ordem de Serviço')
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteOrdemServico({ data: Number(id) })
      toast.success('Ordem de Serviço excluída com sucesso!')
      navigate({ to: '/ordens-servico' })
    } catch {
      toast.error('Erro ao excluir OS')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Editar OS ${os?.numero}`}
        action={
          <div className="flex gap-2">
            <DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/ordens-servico' })} />
            <DefaultButton 
              label="Abrir Gerenciador" 
              variant="outline"
              leftIcon={<Settings2 className="w-4 h-4" />}
              onClick={() => navigate({ to: '/ordens-servico/$id/gerenciar', params: { id } })} 
            />
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection title="Cliente">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Cliente" required error={errors.clienteId?.message}>
              <select
                className={selectCls}
                {...register('clienteId', { valueAsNumber: true })}
              >
                <option value="" disabled>Selecione o cliente...</option>
                {clientes.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </Field>
            <Field label="Telefone de Contato">
              <input
                value={clienteSelecionado?.telefone ?? ''}
                readOnly
                placeholder="Selecione um cliente"
                className={`${inputCls} opacity-70 cursor-not-allowed`}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Detalhes do Serviço">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tipo de Serviço" required error={errors.tipoServico?.message}>
              <select {...register('tipoServico')} className={selectCls}>
                <option value="instalacao">Instalação</option>
                <option value="manutencao">Manutenção</option>
                <option value="troca_equipamento">Troca de Equipamento</option>
                <option value="infra">Infra</option>
                <option value="outro">Outro</option>
              </select>
            </Field>
            <Field label="Status">
              <select {...register('status')} className={selectCls}>
                <option value="aberta">Aberta</option>
                <option value="agendada">Agendada</option>
                <option value="em_execucao">Em Execução</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
                <option value="reagendada">Reagendada</option>
                <option value="pendente">Pendente</option>
              </select>
            </Field>
            <Field label="Prioridade">
              <select {...register('prioridade')} className={selectCls}>
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
              </select>
            </Field>
            <Field label="Valor (R$)">
              <input {...register('valor')} type="number" step="0.01" placeholder="0,00" className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Descrição do Problema / Solicitação">
                <textarea {...register('descricaoProblema')} rows={3} placeholder="Descreva o problema..." className={textareaCls} />
              </Field>
            </div>
          </div>
        </FormSection>

        <FormSection title="Agendamento">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Data / Hora Agendada">
              <input {...register('dataAgendada')} type="datetime-local" className={inputCls} />
            </Field>
            <Field label="Técnico Responsável">
              <select 
                className={selectCls} 
                {...register('tecnicoId', { valueAsNumber: true })}
              >
                <option value="">Selecione o técnico</option>
                {tecnicos.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        <div className="flex items-center justify-between pt-2">
          <DefaultButton 
            variant="outline" 
            leftIcon={<Trash2 className="w-4 h-4" />} 
            label="Excluir OS" 
            className="text-danger border-danger/20 hover:bg-danger/10"
            onClick={() => setShowDeleteModal(true)} 
          />
          <div className="flex items-center gap-3">
            <DefaultButton variant="ghost" label="Cancelar" onClick={() => navigate({ to: '/ordens-servico' })} />
            <DefaultButton type="submit" isLoading={isSubmitting} loadingText="Salvando..." leftIcon={<Save className="w-4 h-4" />} label="Salvar Alterações" className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20" />
          </div>
        </div>
      </form>

      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir Ordem de Serviço"
        description={`Tem certeza que deseja excluir a OS "${os?.numero}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
