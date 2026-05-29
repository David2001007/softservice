import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save, Search, User } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { osSchema  } from '@/features/ordens-servico/schema'
import type {OsInput} from '@/features/ordens-servico/schema';
import { createOrdemServico } from '@/features/ordens-servico/server'

const inputCls =
  'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const selectCls = `${inputCls} cursor-pointer`
const textareaCls =
  'w-full p-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none'

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

export function NovaOrdemServicoPage({
  tecnicos,
}: {
  clientes: any[]
  tecnicos: any[]
}) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OsInput>({
    resolver: zodResolver(osSchema),
    defaultValues: {
      prioridade: 'normal',
      tipoServico: 'instalacao',
      status: 'aberta',
    },
  })

  // Simulated client search
  const [buscaCliente, setBuscaCliente] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null)

  const handleSearchClient = () => {
    // Mock for now. In real app, call an API.
    if (!buscaCliente) return
    if (buscaCliente.length < 3) {
      toast.error('Digite pelo menos 3 caracteres para buscar')
      return
    }
    setClienteSelecionado({
      id: 1,
      nome: 'João da Silva',
      cpfCnpj: '123.456.789-00',
      endereco: 'Rua das Flores, 123 - Centro',
      plano: '300 Mbps',
    })
    toast.success('Cliente encontrado!')
  }

  const onSubmit = async (data: OsInput) => {
    if (!clienteSelecionado) {
      toast.error('Selecione um cliente antes de abrir a OS')
      return
    }
    try {
      await createOrdemServico({
        data: { ...data, clienteId: clienteSelecionado.id },
      })
      toast.success('Ordem de serviço aberta com sucesso!')
      await navigate({ to: '/ordens-servico' })
    } catch (e) {
      toast.error('Erro ao abrir ordem de serviço')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      <PageHeader
        title="Nova Ordem de Serviço"
        action={
          <DefaultButton
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            label="Voltar"
            onClick={() => navigate({ to: '/ordens-servico' })}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit(onSubmit)}
            id="os-form"
            className="space-y-5"
          >
            <FormSection title="Dados da Solicitação">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Tipo de Serviço" required>
                  <select {...register('tipoServico')} className={selectCls}>
                    <option value="instalacao">Instalação</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="troca_equipamento">
                      Troca de Equipamento
                    </option>
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
                  <Field
                    label="Descrição do Problema / Solicitação"
                    required
                    error={errors.descricaoProblema?.message}
                  >
                    <textarea
                      {...register('descricaoProblema')}
                      rows={4}
                      placeholder="Descreva detalhadamente o motivo da OS..."
                      className={textareaCls}
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            <FormSection title="Agendamento (Opcional)">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Data Agendada">
                  <input
                    {...register('dataAgendada')}
                    type="datetime-local"
                    className={inputCls}
                  />
                </Field>
                <Field label="Técnico Responsável">
                  <select
                    {...register('tecnicoId', { valueAsNumber: true })}
                    className={selectCls}
                  >
                    <option value="">Selecione um técnico...</option>
                    {tecnicos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </FormSection>
          </form>
        </div>

        <div className="space-y-5">
          <FormSection title="Cliente">
            {!clienteSelecionado ? (
              <div className="space-y-3">
                <p className="text-xs text-text-muted">
                  Busque um cliente pelo nome, CPF ou CNPJ para vincular à OS.
                </p>
                <div className="flex gap-2">
                  <input
                    value={buscaCliente}
                    onChange={(e) => setBuscaCliente(e.target.value)}
                    placeholder="Nome, CPF ou CNPJ..."
                    className={inputCls}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchClient()}
                  />
                  <DefaultButton
                    variant="outline"
                    onClick={handleSearchClient}
                    leftIcon={<Search className="w-4 h-4" />}
                    className="px-3"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-text text-sm">
                        {clienteSelecionado.nome}
                      </p>
                      <p className="text-xs text-text-muted">
                        {clienteSelecionado.cpfCnpj}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setClienteSelecionado(null)}
                    className="text-xs text-primary hover:underline"
                  >
                    Trocar
                  </button>
                </div>
                <div className="pt-3 border-t border-border space-y-2">
                  <div>
                    <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                      Endereço
                    </span>
                    <p className="text-sm text-text mt-0.5">
                      {clienteSelecionado.endereco}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted uppercase tracking-wider font-medium">
                      Plano Atual
                    </span>
                    <p className="text-sm text-text mt-0.5">
                      {clienteSelecionado.plano}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </FormSection>

          <div className="bg-surface border border-border rounded-xl p-5">
            <DefaultButton
              type="submit"
              form="os-form"
              isLoading={isSubmitting}
              loadingText="Abrindo OS..."
              leftIcon={<Save className="w-4 h-4" />}
              label="Abrir Ordem de Serviço"
              className="w-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
