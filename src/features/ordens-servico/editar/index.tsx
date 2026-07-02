import { useState, useRef, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save, Trash2, Settings2, X } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CopyableOsNumber } from '@/components/copyable-os-number'
import { osSchema  } from '@/features/ordens-servico/schema'
import type {OsInput} from '@/features/ordens-servico/schema';
import {
  updateOrdemServico,
  deleteOrdemServico,
} from '@/features/ordens-servico/server'
import { cn, formatPhone } from '@/lib/utils'
import { isHoliday, isWeekend, checkBusinessHours } from '@/lib/holidays'
import type { BusinessHoursConfig } from '@/lib/holidays'


function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-2">
        {title}
      </h3>
      {children}
    </div>
  )
}

export function EditarOrdemServicoPage({
  os,
  id,
  clientes,
  tecnicos,
  configuracoes,
}: {
  os: any
  id: string
  clientes: any[]
  tecnicos: any[]
  configuracoes?: Record<string, string>
}) {
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHolidaySelected, setIsHolidaySelected] = useState(false)
  const [showHolidayMsg, setShowHolidayMsg] = useState(false)
  const [isWeekendSelected, setIsWeekendSelected] = useState(false)
  const [showWeekendMsg, setShowWeekendMsg] = useState(false)
  const [businessHoursError, setBusinessHoursError] = useState<string | null>(null)
  const [showBusinessHoursMsg, setShowBusinessHoursMsg] = useState(false)
  const [searchCliente, setSearchCliente] = useState(os?.cliente?.nome ?? '')
  const [openClienteList, setOpenClienteList] = useState(false)
  const clienteInputRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OsInput>({
    resolver: zodResolver(osSchema),
    values: os
      ? {
          clienteId: os.clienteId,
          tipoServico: os.tipoServico,
          prioridade: os.prioridade,
          descricaoProblema: os.descricaoProblema || '',
          observacoes: os.observacoes || '',
          status: os.status,
          dataAgendada: os.dataAgendada,
          dataAgendadaDate: os.dataAgendada
            ? (() => {
                const d = new Date(os.dataAgendada)
                const y = d.getFullYear()
                const m = String(d.getMonth() + 1).padStart(2, '0')
                const day = String(d.getDate()).padStart(2, '0')
                return `${y}-${m}-${day}`
              })()
            : '',
          dataAgendadaTime: os.dataAgendada
            ? (() => {
                const d = new Date(os.dataAgendada)
                const h = String(d.getHours()).padStart(2, '0')
                const min = String(d.getMinutes()).padStart(2, '0')
                return `${h}:${min}`
              })()
            : '',
          tecnicoId: os.tecnicoId || undefined,
          valor: os.valor || '',
        }
      : undefined,
  })

  const clienteId = watch('clienteId')
  const clienteSelecionado = clientes.find(
    (c: any) => c.id === Number(clienteId),
  )

  // Filtrar clientes baseado na busca
  const clientesFiltrados = clientes.filter(
    (c: any) =>
      c.nome.toLowerCase().includes(searchCliente.toLowerCase()) ||
      (c.telefone && c.telefone.includes(searchCliente)),
  )

  const handleSelectCliente = (cliente: any) => {
    setValue('clienteId', cliente.id)
    setSearchCliente(cliente.nome)
    setOpenClienteList(false)
  }

  const handleClearCliente = () => {
    setValue('clienteId', undefined as any)
    setSearchCliente('')
    setOpenClienteList(false)
  }

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        clienteInputRef.current &&
        !clienteInputRef.current.contains(event.target as Node)
      ) {
        setOpenClienteList(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Sync separate date and time fields into combined datetime
  const date = watch('dataAgendadaDate');
  const time = watch('dataAgendadaTime');
  // Acrescenta o offset de Brasília (-03:00) para evitar interpretação UTC pelo servidor
  useEffect(() => {
    if (date && time) {
      setValue('dataAgendada', `${date}T${time}:00-03:00`);
    }
  }, [date, time, setValue]);

  useEffect(() => {
    if (date) {
      const d = new Date(date + 'T00:00:00')
      const isFeriado = isHoliday(d)
      const blockFeriados = configuracoes?.['bloquear_atendimento_feriados'] === 'true'
      const newHoliday = isFeriado && blockFeriados
      setIsHolidaySelected(newHoliday)
      if (!newHoliday) setShowHolidayMsg(false)

      const blockFDS = configuracoes?.['bloquear_finais_de_semana'] === 'true'
      const newFDS = isWeekend(d) && blockFDS
      setIsWeekendSelected(newFDS)
      if (!newFDS) setShowWeekendMsg(false)
    } else {
      setIsHolidaySelected(false)
      setShowHolidayMsg(false)
      setIsWeekendSelected(false)
      setShowWeekendMsg(false)
    }
  }, [date, configuracoes])

  useEffect(() => {
    if (date && time) {
      const config: BusinessHoursConfig = {
        entrada: configuracoes?.['horario_entrada'] ?? '',
        inicioIntervalo: configuracoes?.['horario_inicio_intervalo'] ?? '',
        fimIntervalo: configuracoes?.['horario_fim_intervalo'] ?? '',
        saida: configuracoes?.['horario_saida'] ?? '',
      }
      const err = checkBusinessHours(new Date(`${date}T${time}`), config)
      setBusinessHoursError(err)
      if (!err) setShowBusinessHoursMsg(false)
    } else {
      setBusinessHoursError(null)
      setShowBusinessHoursMsg(false)
    }
  }, [date, time, configuracoes])

  const onSubmit = async (data: OsInput) => {
    if (isHolidaySelected || isWeekendSelected || businessHoursError) {
      toast.error('Verifique os avisos no campo de agendamento antes de salvar.')
      return
    }

    if (configuracoes?.['bloquear_os_contrato_nao_assinado'] === 'true') {
      const selectedClient = clientes.find(c => c.id === data.clienteId)
      if (selectedClient && selectedClient.situacaoContrato !== 'assinado') {
        toast.error('Edição bloqueada: o cliente não possui contrato assinado.')
        return
      }
    }

    try {
      const osAtualizada = await updateOrdemServico({ data: { id: os.id, data } })
      toast.success(
        <span>
          OS <CopyableOsNumber numero={osAtualizada.numero} /> atualizada com sucesso!
        </span>,
        { duration: 5000 }
      )
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

  if (!os) return null

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Editar OS ${os?.numero}`}
        action={
          <div className="flex gap-2">
            <DefaultButton
              variant="ghost"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              label="Voltar"
              onClick={() => navigate({ to: '/ordens-servico' })}
            />
            <DefaultButton
              label="Gerenciador"
              variant="outline"
              leftIcon={<Settings2 className="w-4 h-4" />}
              onClick={() =>
                navigate({
                  to: '/ordens-servico/$id/gerenciar',
                  params: { id },
                })
              }
            />
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Cliente */}
        <FormSection title="Cliente">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 relative" ref={clienteInputRef}>
              <Label htmlFor="cliente">Cliente *</Label>
              <div className="relative">
                <Input
                  id="cliente"
                  type="text"
                  placeholder="Digitar nome ou telefone..."
                  value={searchCliente}
                  onChange={(e) => {
                    setSearchCliente(e.target.value)
                    setOpenClienteList(true)
                  }}
                  onFocus={() => setOpenClienteList(true)}
                  aria-invalid={!!errors.clienteId}
                  className={cn(
                    'pr-8',
                    !!errors.clienteId && 'border-destructive',
                  )}
                />
                {searchCliente && (
                  <button
                    type="button"
                    onClick={handleClearCliente}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dropdown com clientes filtrados */}
              {openClienteList && clientesFiltrados.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {clientesFiltrados.map((c: any) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCliente(c)}
                      className={cn(
                        'w-full text-left px-3 py-2.5 hover:bg-accent transition-colors border-b border-border last:border-b-0',
                        clienteId === c.id && 'bg-accent',
                      )}
                    >
                      <div className="text-sm font-medium">{c.nome}</div>
                      {c.telefone && (
                        <div className="text-xs text-muted-foreground">
                          {formatPhone(c.telefone)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {errors.clienteId && (
                <p className="text-xs text-destructive">
                  {errors.clienteId.message}
                </p>
              )}
              <input type="hidden" {...register('clienteId')} />
            </div>
            <div className="space-y-2">
              <Label>Telefone de Contato</Label>
              <Input
                value={clienteSelecionado?.telefone ? formatPhone(clienteSelecionado.telefone) : ''}
                readOnly
                disabled
              />
            </div>
          </div>
        </FormSection>

        {/* Detalhes do Serviço */}
        <FormSection title="Detalhes do Serviço">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoServico">Tipo de Serviço *</Label>
              <Select
                onValueChange={(value) => setValue('tipoServico', value as any)}
                defaultValue={os?.tipoServico}
              >
                <SelectTrigger
                  id="tipoServico"
                  aria-invalid={!!errors.tipoServico}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instalacao">Instalação</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="troca_equipamento">
                    Troca de Equipamento
                  </SelectItem>
                  <SelectItem value="infra">Infraestrutura</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipoServico && (
                <p className="text-xs text-destructive">
                  {errors.tipoServico.message}
                </p>
              )}
              <input type="hidden" {...register('tipoServico')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) => setValue('status', value as any)}
                defaultValue={os?.status}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="em_execucao">Em Execução</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="reagendada">Reagendada</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                onValueChange={(value) => setValue('prioridade', value as any)}
                defaultValue={os?.prioridade}
              >
                <SelectTrigger id="prioridade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" {...register('prioridade')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register('valor')}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="descricao">
                Descrição do Problema / Solicitação
              </Label>
              <Textarea
                id="descricao"
                {...register('descricaoProblema')}
                placeholder="Descreva o problema..."
                rows={3}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                {...register('observacoes')}
                placeholder="Informações adicionais..."
                rows={2}
              />
            </div>
          </div>
        </FormSection>

        {/* Agendamento */}
        <FormSection title="Agendamento">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="dataAgendadaDate">Data</Label>
                {isHolidaySelected && (
                  <button
                    type="button"
                    onClick={() => setShowHolidayMsg(v => !v)}
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-white text-[10px] font-bold cursor-pointer leading-none select-none hover:bg-destructive/80 transition-colors"
                    aria-label="Ver aviso de feriado"
                  >
                    ?
                  </button>
                )}
                {isWeekendSelected && (
                  <button
                    type="button"
                    onClick={() => setShowWeekendMsg(v => !v)}
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-white text-[10px] font-bold cursor-pointer leading-none select-none hover:bg-destructive/80 transition-colors"
                    aria-label="Ver aviso de final de semana"
                  >
                    ?
                  </button>
                )}
              </div>
              <Input
                id="dataAgendadaDate"
                type="date"
                {...register('dataAgendadaDate')}
                className={cn(
                  (isHolidaySelected || isWeekendSelected) && '!border-b-destructive !border-b-2'
                )}
              />
              {isHolidaySelected && showHolidayMsg && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <span className="shrink-0 text-base leading-none">⚠️</span>
                  <span className="font-medium">Não é possível realizar Agendamentos nesta data.</span>
                </div>
              )}
              {isWeekendSelected && showWeekendMsg && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <span className="shrink-0 text-base leading-none">🚫</span>
                  <span className="font-medium">Não é possível realizar Agendamentos em finais de semana.</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="dataAgendadaTime">Hora</Label>
                {businessHoursError && (
                  <button
                    type="button"
                    onClick={() => setShowBusinessHoursMsg(v => !v)}
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-white text-[10px] font-bold cursor-pointer leading-none select-none hover:bg-destructive/80 transition-colors"
                    aria-label="Ver aviso de horário"
                  >
                    ?
                  </button>
                )}
              </div>
              <Input
                id="dataAgendadaTime"
                type="time"
                {...register('dataAgendadaTime')}
                className={cn(businessHoursError && '!border-b-destructive !border-b-2')}
              />
              {businessHoursError && showBusinessHoursMsg && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <span className="shrink-0 text-base leading-none">⏰</span>
                  <span className="font-medium">{businessHoursError}</span>
                </div>
              )}
            </div>
            {/* hidden combined datetime field */}
            <input type="hidden" {...register('dataAgendada')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="tecnico">Técnico Responsável</Label>
              <Select
                onValueChange={(value) =>
                  setValue('tecnicoId', value ? Number(value) : undefined)
                }
                defaultValue={os?.tecnicoId ? String(os.tecnicoId) : ''}
              >
                <SelectTrigger id="tecnico">
                  <SelectValue placeholder="Selecione o técnico" />
                </SelectTrigger>
                <SelectContent>
                  {tecnicos.map((t: any) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register('tecnicoId')} />
            </div>
          </div>
        </FormSection>

        <div className="flex items-center justify-between pt-2">
          <DefaultButton
            type="button"
            variant="outline"
            leftIcon={<Trash2 className="w-4 h-4" />}
            label="Excluir OS"
            className="text-destructive border-destructive/20 hover:bg-destructive/10"
            onClick={() => setShowDeleteModal(true)}
          />
          <div className="flex items-center gap-3">
            <DefaultButton
              variant="ghost"
              label="Cancelar"
              onClick={() => navigate({ to: '/ordens-servico' })}
            />
            <DefaultButton
              type="submit"
              isLoading={isSubmitting}
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
        title="Excluir Ordem de Serviço"
        description={`Tem certeza que deseja excluir a OS "${os?.numero}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
