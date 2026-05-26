import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { osSchema, type OsInput } from '@/features/ordens-servico/schema'
import { updateOrdemServico } from '@/features/ordens-servico/server'

const inputCls = 'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const selectCls = `${inputCls} cursor-pointer`
const textareaCls = 'w-full p-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none'

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

export function EditarOrdemServicoPage({ os, id }: { os: any; id: string }) {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OsInput>({
    resolver: zodResolver(osSchema),
    values: os ? {
      clienteId: os.clienteId,
      tipoServico: os.tipoServico as any,
      prioridade: os.prioridade as any,
      descricaoProblema: os.descricaoProblema,
      status: os.status as any,
      dataAgendada: os.dataAgendada ? new Date(os.dataAgendada).toISOString().slice(0,16) : '',
    } : undefined,
  })

  const onSubmit = async (data: OsInput) => {
    try {
      await updateOrdemServico({ data: { id: Number(id), data } })
      toast.success('Ordem de serviço atualizada com sucesso!')
      await navigate({ to: '/ordens-servico' })
    } catch (e) {
      toast.error('Erro ao atualizar ordem de serviço')
    }
  }

  if (!os) return null

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Editar OS #${os.numero}`}
        action={<DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/ordens-servico' })} />}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection title="Dados da Solicitação">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tipo de Serviço" required>
              <select {...register('tipoServico')} className={selectCls}>
                <option value="instalacao">Instalação</option>
                <option value="manutencao">Manutenção</option>
                <option value="troca_equipamento">Troca de Equipamento</option>
                <option value="infra">Infraestrutura</option>
                <option value="outro">Outro</option>
              </select>
            </Field>
            <Field label="Prioridade" required>
              <select {...register('prioridade')} className={selectCls}>
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Descrição do Problema / Solicitação" required error={errors.descricaoProblema?.message}>
                <textarea {...register('descricaoProblema')} rows={4} className={textareaCls} />
              </Field>
            </div>
          </div>
        </FormSection>

        <FormSection title="Agendamento">
          <div className="grid grid-cols-1 gap-4">
            <Field label="Data Agendada">
              <input {...register('dataAgendada')} type="datetime-local" className={inputCls} />
            </Field>
          </div>
        </FormSection>

        <div className="flex items-center justify-end gap-3 pt-2">
          <DefaultButton variant="ghost" label="Cancelar" onClick={() => navigate({ to: '/ordens-servico' })} />
          <DefaultButton type="submit" isLoading={isSubmitting} loadingText="Salvando..." leftIcon={<Save className="w-4 h-4" />} label="Salvar Alterações" className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20" />
        </div>
      </form>
    </div>
  )
}
