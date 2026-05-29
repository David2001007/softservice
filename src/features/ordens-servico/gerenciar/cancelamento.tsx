import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { XCircle, AlertTriangle } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  osCancelamentoSchema
  
} from '@/features/ordens-servico/schema'
import type {OsCancelamentoInput} from '@/features/ordens-servico/schema';

interface CancelamentoFormProps {
  onSubmit: (data: OsCancelamentoInput) => Promise<void>
  isLoading: boolean
}

export function CancelamentoForm({
  onSubmit,
  isLoading,
}: CancelamentoFormProps) {
  const form = useForm<OsCancelamentoInput>({
    resolver: zodResolver(osCancelamentoSchema),
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          ⚠️ Atenção: Esta ação irá cancelar permanentemente a OS. Confirme o
          motivo abaixo.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="motivo">Motivo do Cancelamento *</Label>
        <Select
          value={form.watch('motivoCancelamento') || ''}
          onValueChange={(value) => form.setValue('motivoCancelamento', value)}
        >
          <SelectTrigger
            id="motivo"
            aria-invalid={!!form.formState.errors.motivoCancelamento}
          >
            <SelectValue placeholder="Selecione o motivo..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cliente_cancelou">Cliente cancelou</SelectItem>
            <SelectItem value="nao_assinante">
              Cliente não é mais assinante
            </SelectItem>
            <SelectItem value="ordem_duplicada">Ordem duplicada</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.motivoCancelamento && (
          <p className="text-xs text-destructive">
            {form.formState.errors.motivoCancelamento.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="responsavel">Responsável pelo Cancelamento</Label>
        <Input
          id="responsavel"
          type="text"
          value="Administrador"
          readOnly
          disabled
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          placeholder="Detalhes adicionais sobre o cancelamento..."
          rows={3}
          {...form.register('observacoes')}
        />
        {form.formState.errors.observacoes && (
          <p className="text-xs text-destructive">
            {form.formState.errors.observacoes.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <DefaultButton type="button" variant="ghost" label="Cancelar" />
        <DefaultButton
          type="submit"
          isLoading={isLoading}
          leftIcon={<XCircle className="w-4 h-4" />}
          label="Confirmar Cancelamento"
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
        />
      </div>
    </form>
  )
}
