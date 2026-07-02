// src/features/ordens-servico/nova.tsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Save, X } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CopyableOsNumber } from '@/components/copyable-os-number'
import { osSchema } from '@/features/ordens-servico/schema'
import type { OsInput } from '@/features/ordens-servico/schema'
import { createOrdemServico } from '@/features/ordens-servico/server'
import { cn, formatDate, formatPhone } from '@/lib/utils'
import { isHoliday, isWeekend, checkBusinessHours } from '@/lib/holidays'
import type { BusinessHoursConfig } from '@/lib/holidays'


function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-2">
        {title}
      </h3>
      {children}
    </div>
  )
}

interface NovaOrdemServicoPageProps {
  clientes: any[]
  tecnicos: any[]
  configuracoes?: Record<string, string>
}

export function NovaOrdemServicoPage({ clientes, tecnicos, configuracoes }: NovaOrdemServicoPageProps) {
  const navigate = useNavigate()
  const [searchCliente, setSearchCliente] = useState('')
  const [openClienteList, setOpenClienteList] = useState(false)
  const [showRetroactiveModal, setShowRetroactiveModal] = useState(false)
  const [pendingOsData, setPendingOsData] = useState<OsInput | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isHolidaySelected, setIsHolidaySelected] = useState(false)
  const [showHolidayMsg, setShowHolidayMsg] = useState(false)
  const [isWeekendSelected, setIsWeekendSelected] = useState(false)
  const [showWeekendMsg, setShowWeekendMsg] = useState(false)
  const [businessHoursError, setBusinessHoursError] = useState<string | null>(null)
  const [showBusinessHoursMsg, setShowBusinessHoursMsg] = useState(false)
  const clienteInputRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OsInput>({
    resolver: zodResolver(osSchema),
    defaultValues: { prioridade: 'normal', status: 'aberta' },
  })

  const date = watch('dataAgendadaDate')
  const time = watch('dataAgendadaTime')

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

  // combine date and time into dataAgendada (hidden field)
  // Acrescenta o offset de Brasília (-03:00) para evitar interpretação UTC pelo servidor
  useEffect(() => {
    if (date && time) {
      setValue('dataAgendada', `${date}T${time}:00-03:00`)
    }
  }, [date, time, setValue])

  const clienteId = watch('clienteId')
  const clienteSelecionado = clientes.find((c: any) => c.id === Number(clienteId))

  const clientesFiltrados = clientes.filter(
    (c: any) =>
      c.nome.toLowerCase().includes(searchCliente.toLowerCase()) ||
      (c.telefone && c.telefone.includes(searchCliente)),
  )

  const numeroOs = `OS${new Date().getFullYear()}${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`

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

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clienteInputRef.current && !clienteInputRef.current.contains(event.target as Node)) {
        setOpenClienteList(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const processSubmit = async (data: OsInput) => {
    setIsConfirming(true)
    try {
      const novaOs = await createOrdemServico({ data })
      toast.success(
        <span>
          OS <CopyableOsNumber numero={novaOs.numero} /> criada com sucesso!
        </span>,
        { duration: 5000 }
      )
      setShowRetroactiveModal(false)
      await navigate({ to: '/ordens-servico' })
    } catch (e) {
      toast.error('Erro ao criar Ordem de Serviço')
      setIsConfirming(false)
    }
  }

  const onSubmit = async (data: OsInput) => {
    if (isHolidaySelected) {
      toast.error('Não é possível realizar Agendamentos nesta data.')
      return
    }
    if (data.dataAgendada) {
      const dataAgendadaDate = new Date(data.dataAgendada)
      const now = new Date()
      if (dataAgendadaDate < now) {
        const comportamentoRetroativo = configuracoes?.['comportamento_agendamento_retroativo'] || 'aviso'
        
        if (comportamentoRetroativo === 'bloquear') {
          toast.error('O agendamento retroativo está bloqueado pelas configurações do sistema.')
          return
        }
        
        if (comportamentoRetroativo === 'aviso') {
          setPendingOsData(data)
          setShowRetroactiveModal(true)
          return
        }
        
        // se for 'permitir', passa reto e cria.
      }
    }

    await processSubmit(data)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      <PageHeader
        title="Cadastro de Ordem de Serviço"
        action={
          <DefaultButton
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            label="Voltar"
            onClick={() => navigate({ to: '/ordens-servico' })}
          />
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Identificação */}
        <FormSection title="Identificação">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Número da OS</Label>
              <Input value={numeroOs} readOnly disabled className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Data de Abertura</Label>
              <Input value={formatDate(new Date())} readOnly disabled />
            </div>
            <div className="space-y-2">
              <Label>Criado por</Label>
              <Input value="Administrador" readOnly disabled />
            </div>
          </div>
        </FormSection>

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
                  onChange={e => {
                    setSearchCliente(e.target.value)
                    setOpenClienteList(true)
                  }}
                  onFocus={() => setOpenClienteList(true)}
                  aria-invalid={!!errors.clienteId}
                  className={cn('pr-8', !!errors.clienteId && 'border-destructive')}
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

              {/* Dropdown */}
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
                        <div className="text-xs text-muted-foreground">{formatPhone(c.telefone)}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {errors.clienteId && (
                <p className="text-xs text-destructive">{errors.clienteId.message}</p>
              )}
              <input type="hidden" {...register('clienteId')} />
            </div>
            <div className="space-y-2">
              <Label>Telefone de Contato</Label>
              <Input value={clienteSelecionado?.telefone ? formatPhone(clienteSelecionado.telefone) : ''} readOnly disabled placeholder="Selecione um cliente" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Endereço</Label>
              <Input
                value={
                  clienteSelecionado
                    ? `${clienteSelecionado.logradouro} — ${clienteSelecionado.cidade}`
                    : ''
                }
                readOnly
                disabled
                placeholder="Preenchido ao selecionar o cliente"
              />
            </div>
          </div>
        </FormSection>

        {/* Agendamento */}
        <FormSection title="Agendamento">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <input type="hidden" {...register('dataAgendada')} />
            <div className="space-y-2">
              <Label htmlFor="tecnicoId">Técnico Responsável</Label>
              <Select onValueChange={value => setValue('tecnicoId', Number(value))}>
                <SelectTrigger id="tecnicoId">
                  <SelectValue placeholder="Selecione um técnico..." />
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

        {/* Serviço */}
        <FormSection title="Detalhes do Serviço">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoServico">Tipo de Serviço *</Label>
              <Select onValueChange={value => setValue('tipoServico', value as any)}>
                <SelectTrigger id="tipoServico" aria-invalid={!!errors.tipoServico}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instalacao">Instalação</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="troca_equipamento">Troca de Equipamento</SelectItem>
                  <SelectItem value="infra">Infraestrutura</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipoServico && (
                <p className="text-xs text-destructive">{errors.tipoServico.message}</p>
              )}
              <input type="hidden" {...register('tipoServico')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select defaultValue="normal" onValueChange={value => setValue('prioridade', value as any)}>
                <SelectTrigger id="prioridade"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" {...register('prioridade')} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="descricao">Descrição do Problema / Solicitação</Label>
              <Textarea id="descricao" {...register('descricaoProblema')} placeholder="Descreva o problema ou a solicitação do cliente..." rows={3} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="observacoes">Observações Gerais</Label>
              <Textarea id="observacoes" {...register('observacoes')} placeholder="Informações adicionais..." rows={2} />
            </div>
          </div>
        </FormSection>

        <div className="flex items-center justify-end gap-3 pt-2">
          <DefaultButton variant="ghost" label="Cancelar" onClick={() => navigate({ to: '/ordens-servico' })} />
          <DefaultButton type="submit" isLoading={isSubmitting} leftIcon={<Save className="w-4 h-4" />} label="Criar Ordem de Serviço" className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20" />
        </div>
      </form>

      <Dialog open={showRetroactiveModal} onOpenChange={setShowRetroactiveModal}>
        <DialogContent aria-describedby="retro-dialog-description">
          <DialogHeader>
            <DialogTitle>Aviso: Data Retroativa</DialogTitle>
            <DialogDescription id="retro-dialog-description">Essa OS está com data retroativa, deseja confirmar?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DefaultButton variant="ghost" label="Não" onClick={() => setShowRetroactiveModal(false)} disabled={isConfirming} />
            <DefaultButton label="Sim" onClick={() => { if (pendingOsData) processSubmit(pendingOsData) }} isLoading={isConfirming} className="bg-primary hover:bg-primary-hover text-white" />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
