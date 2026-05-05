import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, CalendarClock, XCircle, History, Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { StatusBadge } from '@/components/status-badge'
import { formatDate } from '@/lib/utils'
import {
  osConclusaoSchema, osReagendamentoSchema, osCancelamentoSchema,
  type OsConclusaoInput, type OsReagendamentoInput, type OsCancelamentoInput,
} from '@/features/ordens-servico/schema'
import { getOrdemServico, concluirOrdemServico, reagendarOrdemServico, cancelarOrdemServico } from '@/features/ordens-servico/server'
import { getMateriais } from '@/features/materiais/server'
import { getTecnicos } from '@/features/tecnicos/server'

export const Route = createFileRoute('/_app/ordens-servico/$id/gerenciar')({
  loader: async ({ params }) => {
    const [os, materiais, tecnicos] = await Promise.all([
      getOrdemServico({ data: Number(params.id) }),
      getMateriais(),
      getTecnicos()
    ])
    return { os, materiais, tecnicos }
  },
  component: GerenciadorOsPage,
})

const inputCls = 'w-full h-10 px-3 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
const selectCls = `${inputCls} cursor-pointer`
const textareaCls = 'w-full px-3 py-2.5 rounded-lg bg-background border border-border text-text text-sm placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none'

function Field({ label, required, error, children, hint }: { label: string; required?: boolean; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">{label}{required && <span className="text-danger ml-1">*</span>}</label>
      {hint && <p className="text-xs text-text-muted -mt-1">{hint}</p>}
      {children}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}



type Tab = 'conclusao' | 'reagendamento' | 'cancelamento' | 'historico'

interface MaterialLinha {
  materialId: number
  quantidade: string
  tipoUso: 'comodato' | 'venda' | 'uso_interno'
  localSaida: 'estoque_principal' | 'estoque_tecnico'
}

function GerenciadorOsPage() {
  const navigate = useNavigate()
  const { os: osData, materiais: materiaisMock, tecnicos: tecnicosMock } = Route.useLoaderData()
  const historico = osData?.historico || []

  const [tab, setTab] = useState<Tab>('conclusao')
  const [materiais, setMateriais] = useState<MaterialLinha[]>([])

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'conclusao', label: 'Conclusão', icon: CheckCircle2 },
    { id: 'reagendamento', label: 'Reagendamento', icon: CalendarClock },
    { id: 'cancelamento', label: 'Cancelamento', icon: XCircle },
    { id: 'historico', label: 'Histórico', icon: History },
  ]

  // ── Conclusão ──
  const conclusaoForm = useForm<OsConclusaoInput>({
    resolver: zodResolver(osConclusaoSchema),
    defaultValues: { resultadoServico: true, materiais: [] },
  })

  const addMaterial = () =>
    setMateriais((m) => [...m, { materialId: 0, quantidade: '1', tipoUso: 'uso_interno', localSaida: 'estoque_principal' }])

  const removeMaterial = (i: number) =>
    setMateriais((m) => m.filter((_, idx) => idx !== i))

  const onConcluir = async (data: OsConclusaoInput) => {
    try {
      await concluirOrdemServico({ data: { id: Number(osData?.id), data: { ...data, materiais } } })
      toast.success('OS concluída e materiais baixados com sucesso!')
      await navigate({ to: '/ordens-servico' })
    } catch (e) { toast.error('Erro ao concluir OS') }
  }

  // ── Reagendamento ──
  const reagendamentoForm = useForm<OsReagendamentoInput>({
    resolver: zodResolver(osReagendamentoSchema),
  })

  const onReagendar = async (data: OsReagendamentoInput) => {
    try {
      await reagendarOrdemServico({ data: { id: Number(osData?.id), data } })
      toast.success('OS reagendada com sucesso!')
      await navigate({ to: '/ordens-servico' })
    } catch (e) { toast.error('Erro ao reagendar OS') }
  }

  // ── Cancelamento ──
  const cancelamentoForm = useForm<OsCancelamentoInput>({
    resolver: zodResolver(osCancelamentoSchema),
  })

  const onCancelar = async (data: OsCancelamentoInput) => {
    try {
      await cancelarOrdemServico({ data: { id: Number(osData?.id), data } })
      toast.success('OS cancelada.')
      await navigate({ to: '/ordens-servico' })
    } catch (e) { toast.error('Erro ao cancelar OS') }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 fade-in">
      <PageHeader
        title="Gerenciador de Ordem de Serviço"
        action={<DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/ordens-servico' })} />}
      />

      {/* Cabeçalho da OS */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <span className="font-mono text-xl font-bold text-gold">{osData?.numero}</span>
          <StatusBadge value={osData?.status || ''} type="os" />
          <StatusBadge value={osData?.prioridade || ''} type="prioridade" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
          {[
            { label: 'Cliente', value: osData?.cliente?.nome },
            { label: 'Endereço', value: `${osData?.cliente?.logradouro || ''} — ${osData?.cliente?.cidade || ''}` },
            { label: 'Tipo de Serviço', value: osData?.tipoServico },
            { label: 'Técnico Responsável', value: osData?.tecnico?.nome },
            { label: 'Data de Abertura', value: formatDate(new Date(osData?.dataAbertura as Date)) },
            { label: 'Data Agendada', value: osData?.dataAgendada ? formatDate(new Date(osData.dataAgendada), { time: true }) : '-' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-text-muted font-medium">{label}</p>
              <p className="text-sm text-text mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Abas */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                tab === id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-text-muted hover:text-text hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── Conclusão ── */}
          {tab === 'conclusao' && (
            <form onSubmit={conclusaoForm.handleSubmit(onConcluir)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Data/Hora de Início Efetivo">
                  <input {...conclusaoForm.register('dataInicioEfetivo')} type="datetime-local" className={inputCls} />
                </Field>
                <Field label="Data/Hora de Término Efetivo">
                  <input {...conclusaoForm.register('dataTerminoEfetivo')} type="datetime-local" className={inputCls} />
                </Field>
              </div>

              {/* Resultado */}
              <div className="flex items-center gap-6 p-3 rounded-lg bg-background border border-border">
                <span className="text-sm font-medium text-text">Serviço concluído com sucesso?</span>
                <div className="flex gap-4">
                  {[{ v: true, label: 'Sim' }, { v: false, label: 'Não' }].map(({ v, label }) => (
                    <label key={String(v)} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        className="accent-primary w-4 h-4"
                        checked={conclusaoForm.watch('resultadoServico') === v}
                        onChange={() => conclusaoForm.setValue('resultadoServico', v)}
                      />
                      <span className="text-sm text-text">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Field label="Observações Finais">
                <textarea {...conclusaoForm.register('observacoesFinais')} rows={2} placeholder="Descreva o resultado do atendimento..." className={textareaCls} />
              </Field>

              {/* Materiais utilizados */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-text">Materiais Utilizados</h4>
                  <DefaultButton size="sm" variant="ghost" leftIcon={<Plus className="w-3.5 h-3.5" />} label="Adicionar" onClick={addMaterial} className="h-7 text-xs" />
                </div>

                {materiais.length === 0 && (
                  <p className="text-xs text-text-muted py-3 text-center border border-dashed border-border rounded-lg">
                    Nenhum material adicionado. Clique em "Adicionar" para registrar materiais utilizados.
                  </p>
                )}

                {materiais.map((m, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-background border border-border">
                    <select
                      className={`${selectCls} sm:col-span-1`}
                      value={m.materialId}
                      onChange={(e) => setMateriais((prev) => prev.map((x, idx) => idx === i ? { ...x, materialId: Number(e.target.value) } : x))}
                    >
                      <option value={0}>Material...</option>
                      {materiaisMock.map((mat: any) => (
                        <option key={mat.id} value={mat.id}>{mat.descricao}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Qtd."
                      value={m.quantidade}
                      onChange={(e) => setMateriais((prev) => prev.map((x, idx) => idx === i ? { ...x, quantidade: e.target.value } : x))}
                      className={inputCls}
                    />
                    <select
                      className={selectCls}
                      value={m.tipoUso}
                      onChange={(e) => setMateriais((prev) => prev.map((x, idx) => idx === i ? { ...x, tipoUso: e.target.value as MaterialLinha['tipoUso'] } : x))}
                    >
                      <option value="uso_interno">Uso Interno</option>
                      <option value="comodato">Comodato</option>
                      <option value="venda">Venda</option>
                    </select>
                    <div className="flex gap-2">
                      <select
                        className={`${selectCls} flex-1`}
                        value={m.localSaida}
                        onChange={(e) => setMateriais((prev) => prev.map((x, idx) => idx === i ? { ...x, localSaida: e.target.value as MaterialLinha['localSaida'] } : x))}
                      >
                        <option value="estoque_principal">Est. Principal</option>
                        <option value="estoque_tecnico">Est. Técnico</option>
                      </select>
                      <button onClick={() => removeMaterial(i)} type="button" className="w-10 h-10 rounded-lg flex items-center justify-center text-danger hover:bg-danger/10 transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <DefaultButton variant="ghost" label="Salvar Rascunho" />
                <DefaultButton
                  type="submit"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  label="Confirmar Conclusão e Baixar Materiais"
                  className="bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20"
                />
              </div>
            </form>
          )}

          {/* ── Reagendamento ── */}
          {tab === 'reagendamento' && (
            <form onSubmit={reagendamentoForm.handleSubmit(onReagendar)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Data/Hora Atual da OS">
                  <input value={osData?.dataAgendada ? formatDate(new Date(osData.dataAgendada), { time: true }) : '-'} readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} />
                </Field>
                <Field label="Nova Data/Hora Agendada" required error={reagendamentoForm.formState.errors.novaDataAgendada?.message}>
                  <input {...reagendamentoForm.register('novaDataAgendada')} type="datetime-local" className={inputCls} />
                </Field>
              </div>

              <Field label="Motivo do Reagendamento" required error={reagendamentoForm.formState.errors.motivoReagendamento?.message}>
                <select {...reagendamentoForm.register('motivoReagendamento')} className={selectCls}>
                  <option value="">Selecione o motivo...</option>
                  <option value="cliente_ausente">Cliente ausente</option>
                  <option value="problema_acesso">Problema de acesso ao local</option>
                  <option value="falta_material">Falta de material</option>
                  <option value="condicao_climatica">Condição climática</option>
                  <option value="outro">Outro</option>
                </select>
              </Field>

              <Field label="Técnico Responsável (opcional)">
                <select className={selectCls} onChange={(e) => reagendamentoForm.setValue('tecnicoId', Number(e.target.value))}>
                  <option value="">Manter técnico atual ({osData?.tecnico?.nome})</option>
                  {tecnicosMock.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </Field>

              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-xs">
                O status da OS será alterado para <strong>Reagendada</strong> ao confirmar.
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <DefaultButton variant="ghost" label="Cancelar" onClick={() => setTab('conclusao')} />
                <DefaultButton
                  type="submit"
                  isLoading={reagendamentoForm.formState.isSubmitting}
                  leftIcon={<CalendarClock className="w-4 h-4" />}
                  label="Confirmar Reagendamento"
                  className="bg-warning hover:bg-warning/90 text-white shadow-lg shadow-warning/20"
                />
              </div>
            </form>
          )}

          {/* ── Cancelamento ── */}
          {tab === 'cancelamento' && (
            <form onSubmit={cancelamentoForm.handleSubmit(onCancelar)} className="space-y-4">
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm font-medium">
                ⚠️ Atenção: Esta ação irá cancelar permanentemente a OS. Confirme o motivo abaixo.
              </div>

              <Field label="Motivo do Cancelamento" required error={cancelamentoForm.formState.errors.motivoCancelamento?.message}>
                <select {...cancelamentoForm.register('motivoCancelamento')} className={selectCls}>
                  <option value="">Selecione o motivo...</option>
                  <option value="cliente_cancelou">Cliente cancelou</option>
                  <option value="nao_assinante">Cliente não é mais assinante</option>
                  <option value="ordem_duplicada">Ordem duplicada</option>
                  <option value="outro">Outro</option>
                </select>
              </Field>

              <Field label="Responsável pelo Cancelamento">
                <input value="Administrador" readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} />
              </Field>

              <Field label="Observações" error={cancelamentoForm.formState.errors.observacoes?.message}>
                <textarea {...cancelamentoForm.register('observacoes')} rows={3} placeholder="Detalhes adicionais sobre o cancelamento..." className={textareaCls} />
              </Field>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <DefaultButton variant="ghost" label="Cancelar" onClick={() => setTab('conclusao')} />
                <DefaultButton
                  type="submit"
                  isLoading={cancelamentoForm.formState.isSubmitting}
                  leftIcon={<XCircle className="w-4 h-4" />}
                  label="Confirmar Cancelamento"
                  className="bg-danger hover:bg-danger/90 text-white shadow-lg shadow-danger/20"
                />
              </div>
            </form>
          )}

          {/* ── Histórico ── */}
          {tab === 'historico' && (
            <div className="space-y-3">
              <p className="text-xs text-text-muted">Linha do tempo de todas as movimentações desta OS (somente leitura).</p>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-px before:bg-border">
                {historico.map((h: any) => (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                    <div className="bg-background border border-border rounded-xl p-4 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-text">{h.acao}</span>
                        {h.statusAnterior && (
                          <>
                            <StatusBadge value={h.statusAnterior} type="os" />
                            <span className="text-text-muted text-xs">→</span>
                            <StatusBadge value={h.statusNovo} type="os" />
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span>{formatDate(new Date(h.dataHora), { time: true })}</span>
                        <span>•</span>
                        <span>{h.usuario?.nome || 'Sistema'}</span>
                        {h.motivo && <><span>•</span><span>{h.motivo}</span></>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
