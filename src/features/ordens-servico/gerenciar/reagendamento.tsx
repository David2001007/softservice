import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarClock, AlertCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DefaultButton } from '@/components/default-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  osReagendamentoSchema
  
} from '@/features/ordens-servico/schema'
import type {OsReagendamentoInput} from '@/features/ordens-servico/schema'
import { cn, formatDate } from '@/lib/utils'
import { isHoliday, isWeekend, checkBusinessHours } from '@/lib/holidays'
import type { BusinessHoursConfig } from '@/lib/holidays'

/**
 * Converte o valor de um <input type="datetime-local"> ("YYYY-MM-DDTHH:mm", sem fuso)
 * para uma string ISO com offset fixo de Brasília (-03:00).
 */
function toISOWithBROffset(datetimeLocal: string): string {
  if (!datetimeLocal) return datetimeLocal
  const normalized = datetimeLocal.length === 16 ? `${datetimeLocal}:00` : datetimeLocal
  return `${normalized}-03:00`
}

interface ReagendamentoFormProps {
  osId: number | string
  onSubmit: (data: OsReagendamentoInput) => Promise<void>
  isLoading: boolean
  dataAgendadaAtual?: Date | string
  tecnicoNomeAtual?: string
  tecnicos?: Array<{ id: number; nome: string }>
  configuracoes?: Record<string, string>
}

const CACHE_KEY_PREFIX = 'os-gerenciar-reagendamento-'

export function ReagendamentoForm({
  osId,
  onSubmit,
  isLoading,
  dataAgendadaAtual,
  tecnicoNomeAtual,
  tecnicos,
  configuracoes,
}: ReagendamentoFormProps) {
  const cacheKey = `${CACHE_KEY_PREFIX}${osId}`

  // Estados dos avisos de validação
  const [isHolidaySelected, setIsHolidaySelected] = useState(false)
  const [showHolidayMsg, setShowHolidayMsg] = useState(false)
  const [isWeekendSelected, setIsWeekendSelected] = useState(false)
  const [showWeekendMsg, setShowWeekendMsg] = useState(false)
  const [businessHoursError, setBusinessHoursError] = useState<string | null>(null)
  const [showBusinessHoursMsg, setShowBusinessHoursMsg] = useState(false)

  // Load from cache on mount
  const initialData = useMemo(() => {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      return JSON.parse(cached) as Partial<OsReagendamentoInput>
    }
    return null
  }, [cacheKey])

  const form = useForm<OsReagendamentoInput>({
    resolver: zodResolver(osReagendamentoSchema),
    defaultValues: initialData || {},
  })

  // Save to cache whenever data changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      localStorage.setItem(cacheKey, JSON.stringify(data))
    })
    return () => subscription.unsubscribe()
  }, [form, cacheKey])

  // Observar o campo novaDataAgendada para extrair data e hora separados
  const novaDataAgendada = form.watch('novaDataAgendada')

  // Extrai somente a parte da data ("YYYY-MM-DD") e da hora ("HH:mm") do datetime-local
  const novaDate = novaDataAgendada ? novaDataAgendada.slice(0, 10) : ''
  const novaTime = novaDataAgendada ? novaDataAgendada.slice(11, 16) : ''

  // Validação de feriado e fim de semana ao mudar a data
  useEffect(() => {
    if (novaDate) {
      const d = new Date(novaDate + 'T00:00:00')
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
  }, [novaDate, configuracoes])

  // Validação de horário comercial ao mudar data ou hora
  useEffect(() => {
    if (novaDate && novaTime) {
      const config: BusinessHoursConfig = {
        entrada: configuracoes?.['horario_entrada'] ?? '',
        inicioIntervalo: configuracoes?.['horario_inicio_intervalo'] ?? '',
        fimIntervalo: configuracoes?.['horario_fim_intervalo'] ?? '',
        saida: configuracoes?.['horario_saida'] ?? '',
      }
      const err = checkBusinessHours(new Date(`${novaDate}T${novaTime}`), config)
      setBusinessHoursError(err)
      if (!err) setShowBusinessHoursMsg(false)
    } else {
      setBusinessHoursError(null)
      setShowBusinessHoursMsg(false)
    }
  }, [novaDate, novaTime, configuracoes])

  const hasBlockingError = isHolidaySelected || isWeekendSelected || !!businessHoursError

  return (
    <form
      onSubmit={form.handleSubmit((data) =>
        onSubmit({
          ...data,
          // Converter datetime-local (sem fuso) para ISO com offset de Brasília
          novaDataAgendada: data.novaDataAgendada
            ? toISOWithBROffset(data.novaDataAgendada)
            : data.novaDataAgendada,
        })
      )}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dataAtual">Data/Hora Atual da OS</Label>
          <Input
            id="dataAtual"
            type="text"
            value={
              dataAgendadaAtual
                ? formatDate(new Date(dataAgendadaAtual), { time: true })
                : '-'
            }
            readOnly
            disabled
          />
        </div>
        <div className="space-y-2">
          {/* Label com botões de aviso */}
          <div className="flex items-center gap-1.5">
            <Label htmlFor="novaData">Nova Data/Hora Agendada *</Label>
            {isHolidaySelected && (
              <button
                type="button"
                onClick={() => setShowHolidayMsg((v) => !v)}
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-white text-[10px] font-bold cursor-pointer leading-none select-none hover:bg-destructive/80 transition-colors"
                aria-label="Ver aviso de feriado"
              >
                ?
              </button>
            )}
            {isWeekendSelected && (
              <button
                type="button"
                onClick={() => setShowWeekendMsg((v) => !v)}
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-white text-[10px] font-bold cursor-pointer leading-none select-none hover:bg-destructive/80 transition-colors"
                aria-label="Ver aviso de fim de semana"
              >
                ?
              </button>
            )}
            {businessHoursError && (
              <button
                type="button"
                onClick={() => setShowBusinessHoursMsg((v) => !v)}
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-white text-[10px] font-bold cursor-pointer leading-none select-none hover:bg-destructive/80 transition-colors"
                aria-label="Ver aviso de horário"
              >
                ?
              </button>
            )}
          </div>

          <Input
            id="novaData"
            type="datetime-local"
            {...form.register('novaDataAgendada')}
            aria-invalid={!!form.formState.errors.novaDataAgendada}
            className={cn(
              hasBlockingError && '!border-b-destructive !border-b-2',
            )}
          />

          {/* Mensagens de aviso */}
          {isHolidaySelected && showHolidayMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <span className="shrink-0 text-base leading-none">⚠️</span>
              <span className="font-medium">Não é possível reagendar para esta data (feriado).</span>
            </div>
          )}
          {isWeekendSelected && showWeekendMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <span className="shrink-0 text-base leading-none">🚫</span>
              <span className="font-medium">Não é possível reagendar para finais de semana.</span>
            </div>
          )}
          {businessHoursError && showBusinessHoursMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <span className="shrink-0 text-base leading-none">⏰</span>
              <span className="font-medium">{businessHoursError}</span>
            </div>
          )}

          {form.formState.errors.novaDataAgendada && (
            <p className="text-xs text-destructive">
              {form.formState.errors.novaDataAgendada.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivo">Motivo do Reagendamento *</Label>
        <Select
          value={form.watch('motivoReagendamento') || ''}
          onValueChange={(value) => form.setValue('motivoReagendamento', value)}
        >
          <SelectTrigger
            id="motivo"
            aria-invalid={!!form.formState.errors.motivoReagendamento}
          >
            <SelectValue placeholder="Selecione o motivo..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cliente_ausente">Cliente ausente</SelectItem>
            <SelectItem value="problema_acesso">
              Problema de acesso ao local
            </SelectItem>
            <SelectItem value="falta_material">Falta de material</SelectItem>
            <SelectItem value="condicao_climatica">
              Condição climática
            </SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.motivoReagendamento && (
          <p className="text-xs text-destructive">
            {form.formState.errors.motivoReagendamento.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tecnico">Técnico Responsável (opcional)</Label>
        <Select
          value={form.watch('tecnicoId') ? String(form.watch('tecnicoId')) : ''}
          onValueChange={(value) =>
            form.setValue('tecnicoId', value ? Number(value) : undefined)
          }
        >
          <SelectTrigger id="tecnico">
            <SelectValue
              placeholder={`Manter técnico atual (${tecnicoNomeAtual})`}
            />
          </SelectTrigger>
          <SelectContent>
            {(tecnicos || []).map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          O status da OS será alterado para <strong>Reagendada</strong> ao
          confirmar.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <DefaultButton type="button" variant="ghost" label="Cancelar" />
        <DefaultButton
          type="submit"
          isLoading={isLoading}
          disabled={hasBlockingError}
          leftIcon={<CalendarClock className="w-4 h-4" />}
          label="Confirmar Reagendamento"
          className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </form>
  )
}
