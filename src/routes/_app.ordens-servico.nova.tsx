import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { osSchema, type OsInput } from '@/features/ordens-servico/schema'
import { createOrdemServico } from '@/features/ordens-servico/server'
import { getClientes } from '@/features/clientes/server'
import { getTecnicos } from '@/features/tecnicos/server'

export const Route = createFileRoute('/_app/ordens-servico/nova')({
  loader: async () => {
    const [clientes, tecnicos] = await Promise.all([getClientes(), getTecnicos()])
    return { clientes, tecnicos }
  },
  component: NovaOsPage,
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



function NovaOsPage() {
  const navigate = useNavigate()
  const { clientes, tecnicos } = Route.useLoaderData()
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<OsInput>({
    resolver: zodResolver(osSchema),
    defaultValues: { prioridade: 'normal', status: 'aberta' },
  })

  const clienteId = watch('clienteId')
  const clienteSelecionado = clientes.find((c: any) => c.id === Number(clienteId))

  // Gerar número da OS automaticamente
  const numeroOs = `OS-${Date.now().toString().slice(-5)}`

  const onSubmit = async (data: OsInput) => {
    try {
      await createOrdemServico({ data })
      toast.success('Ordem de Serviço criada com sucesso!')
      await navigate({ to: '/ordens-servico' })
    } catch (e) {
      toast.error('Erro ao criar Ordem de Serviço')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      <PageHeader
        title="Cadastro de Ordem de Serviço"
        action={
          <DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/ordens-servico' })} />
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Cabeçalho */}
        <FormSection title="Identificação">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Número da OS">
              <input value={numeroOs} readOnly className={`${inputCls} bg-background/40 text-gold font-mono cursor-not-allowed`} />
            </Field>
            <Field label="Data de Abertura">
              <input value={new Date().toLocaleDateString('pt-BR')} readOnly className={`${inputCls} cursor-not-allowed opacity-60`} />
            </Field>
            <Field label="Criado por">
              <input value="Administrador" readOnly className={`${inputCls} cursor-not-allowed opacity-60`} />
            </Field>
          </div>
        </FormSection>

        {/* Cliente */}
        <FormSection title="Cliente">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Cliente" required error={errors.clienteId?.message}>
              <select
                className={selectCls}
                onChange={(e) => setValue('clienteId', Number(e.target.value))}
                defaultValue=""
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
            <div className="sm:col-span-2">
              <Field label="Endereço">
                <input
                  value={clienteSelecionado ? `${clienteSelecionado.logradouro} — ${clienteSelecionado.cidade}` : ''}
                  readOnly
                  placeholder="Preenchido ao selecionar o cliente"
                  className={`${inputCls} opacity-70 cursor-not-allowed`}
                />
              </Field>
            </div>
          </div>
        </FormSection>

        {/* Serviço */}
        <FormSection title="Detalhes do Serviço">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tipo de Serviço" required error={errors.tipoServico?.message}>
              <select {...register('tipoServico')} className={selectCls}>
                <option value="" disabled>Selecione...</option>
                <option value="instalacao">Instalação</option>
                <option value="manutencao">Manutenção</option>
                <option value="troca_equipamento">Troca de Equipamento</option>
                <option value="infra">Infra</option>
                <option value="outro">Outro</option>
              </select>
            </Field>
            <Field label="Prioridade">
              <select {...register('prioridade')} className={selectCls}>
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Descrição do Problema / Solicitação">
                <textarea {...register('descricaoProblema')} rows={3} placeholder="Descreva o problema ou a solicitação do cliente..." className={textareaCls} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Observações Gerais">
                <textarea {...register('observacoes')} rows={2} placeholder="Informações adicionais..." className={textareaCls} />
              </Field>
            </div>
          </div>
        </FormSection>

        {/* Agendamento */}
        <FormSection title="Agendamento">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Data / Hora Agendada">
              <input {...register('dataAgendada')} type="datetime-local" className={inputCls} />
            </Field>
            <Field label="Técnico Responsável">
              <select className={selectCls} onChange={(e) => setValue('tecnicoId', Number(e.target.value))}>
                <option value="">Selecione o técnico</option>
                {tecnicos.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </Field>
            <Field label="Valor (R$)">
              <input {...register('valor')} type="number" step="0.01" placeholder="0,00" className={inputCls} />
            </Field>
          </div>
        </FormSection>

        <div className="flex items-center justify-end gap-3 pt-2">
          <DefaultButton variant="ghost" label="Cancelar" onClick={() => navigate({ to: '/ordens-servico' })} />
          <DefaultButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Salvando..."
            leftIcon={<Save className="w-4 h-4" />}
            label="Criar Ordem de Serviço"
            className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
          />
        </div>
      </form>
    </div>
  )
}
