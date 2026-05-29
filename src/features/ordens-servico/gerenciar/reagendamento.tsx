import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarClock, AlertCircle } from 'lucide-react'
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
import type {OsReagendamentoInput} from '@/features/ordens-servico/schema';
import { formatDate } from '@/lib/utils'

interface ReagendamentoFormProps {
  onSubmit: (data: OsReagendamentoInput) => Promise<void>
  isLoading: boolean
  dataAgendadaAtual?: Date | string
  tecnicoNomeAtual?: string
  tecnicos?: Array<{ id: number; nome: string }>
}

export function ReagendamentoForm({
  onSubmit,
  isLoading,
  dataAgendadaAtual,
  tecnicoNomeAtual,
  tecnicos,
}: ReagendamentoFormProps) {
  const form = useForm<OsReagendamentoInput>({
    resolver: zodResolver(osReagendamentoSchema),
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Label htmlFor="novaData">Nova Data/Hora Agendada *</Label>
          <Input
            id="novaData"
            type="datetime-local"
            {...form.register('novaDataAgendada')}
            aria-invalid={!!form.formState.errors.novaDataAgendada}
          />
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
          leftIcon={<CalendarClock className="w-4 h-4" />}
          label="Confirmar Reagendamento"
          className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-600/20"
        />
      </div>
    </form>
  )
}
