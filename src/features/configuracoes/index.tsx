import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { DefaultButton } from '@/components/default-button'
import {
  CalendarDays,
  ShieldAlert,
  Clock,
  Save,
  CalendarOff,
  Coffee,
  Users,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/stores/auth.store'
import { saveConfiguracao } from '@/features/configuracoes/server'

interface ConfiguracoesPageProps {
  configMap: Record<string, string>
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4 border-b border-border pb-4 mb-5">
      <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <div>
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3 border-b border-border/50 last:border-b-0">
      <div className="space-y-0.5 flex-1">
        <Label htmlFor={id} className="text-sm font-medium text-text cursor-pointer">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground max-w-xl">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}

export function ConfiguracoesPage({ configMap }: ConfiguracoesPageProps) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isTecnico = user?.type === 'tecnico'

  // --- Regras de Atendimento ---
  const [bloquearFeriados, setBloquearFeriados] = useState(
    configMap['bloquear_atendimento_feriados'] === 'true',
  )
  const [bloquearFDS, setBloquearFDS] = useState(
    configMap['bloquear_finais_de_semana'] === 'true',
  )
  const [bloquearOsContratoNaoAssinado, setBloquearOsContratoNaoAssinado] = useState(
    configMap['bloquear_os_contrato_nao_assinado'] === 'true',
  )
  const [comportamentoRetroativo, setComportamentoRetroativo] = useState(
    configMap['comportamento_agendamento_retroativo'] || 'aviso',
  )

  const handleRetroativoChange = async (value: string) => {
    if (isTecnico) return
    setComportamentoRetroativo(value)
    try {
      await saveConfiguracao({ data: { key: 'comportamento_agendamento_retroativo', value } })
      toast.success('Configuração atualizada!')
      router.invalidate()
    } catch (e: any) {
      setComportamentoRetroativo(configMap['comportamento_agendamento_retroativo'] || 'aviso')
      toast.error(e.message || 'Erro ao salvar configuração')
    }
  }

  // --- Horário de Atendimento ---
  const [horario, setHorario] = useState({
    entrada: configMap['horario_entrada'] ?? '',
    inicioIntervalo: configMap['horario_inicio_intervalo'] ?? '',
    fimIntervalo: configMap['horario_fim_intervalo'] ?? '',
    saida: configMap['horario_saida'] ?? '',
  })
  const [isSavingHorario, setIsSavingHorario] = useState(false)

  // --- Cadastro de Clientes ---
  const [obrigarTelefone, setObrigarTelefone] = useState(
    configMap['obrigar_telefone'] === 'true',
  )
  const [obrigarCpfCnpj, setObrigarCpfCnpj] = useState(
    configMap['obrigar_cpf_cnpj'] === 'true',
  )
  const [validarCpfCnpj, setValidarCpfCnpj] = useState(
    configMap['validar_cpf_cnpj'] === 'true',
  )

  const handleToggle = async (key: string, checked: boolean, setter: (v: boolean) => void) => {
    if (isTecnico) return
    setter(checked)
    try {
      await saveConfiguracao({ data: { key, value: checked ? 'true' : 'false' } })
      toast.success('Configuração atualizada!')
      router.invalidate()
    } catch (e: any) {
      setter(!checked)
      toast.error(e.message || 'Erro ao salvar configuração')
    }
  }

  const handleSaveHorario = async () => {
    if (isTecnico) return

    if ((horario.entrada && !horario.saida) || (!horario.entrada && horario.saida)) {
      toast.error('Preencha os horários de entrada e saída juntos, ou deixe ambos em branco.')
      return
    }
    if ((horario.inicioIntervalo && !horario.fimIntervalo) || (!horario.inicioIntervalo && horario.fimIntervalo)) {
      toast.error('Preencha início e fim do intervalo juntos, ou deixe ambos em branco.')
      return
    }

    setIsSavingHorario(true)
    try {
      await Promise.all([
        saveConfiguracao({ data: { key: 'horario_entrada', value: horario.entrada } }),
        saveConfiguracao({ data: { key: 'horario_inicio_intervalo', value: horario.inicioIntervalo } }),
        saveConfiguracao({ data: { key: 'horario_fim_intervalo', value: horario.fimIntervalo } }),
        saveConfiguracao({ data: { key: 'horario_saida', value: horario.saida } }),
      ])
      toast.success('Horário de atendimento salvo com sucesso!')
      router.invalidate()
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar horário')
    } finally {
      setIsSavingHorario(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 fade-in">
      <PageHeader
        title="Configurações do Sistema"
        subtitle="Gerenciamento de regras de negócio globais"
      />

      {isTecnico && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs px-4 py-3 rounded-lg">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Apenas administradores podem modificar as configurações globais do sistema.</span>
        </div>
      )}

      {/* Seção: Regras de Agendamento */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-1">
        <SectionHeader
          icon={CalendarDays}
          title="Regras de Agendamento"
          description="Restrições para o agendamento de ordens de serviço."
        />

        <ToggleRow
          id="bloquear-feriados"
          label="Bloquear atendimento em feriados"
          description="Impede o agendamento em datas que coincidam com feriados nacionais brasileiros (fixos e móveis)."
          checked={bloquearFeriados}
          onCheckedChange={(v) =>
            handleToggle('bloquear_atendimento_feriados', v, setBloquearFeriados)
          }
          disabled={isTecnico}
        />

        <ToggleRow
          id="bloquear-fds"
          label="Bloquear atendimento em finais de semana"
          description="Impede o agendamento de OS em sábados e domingos."
          checked={bloquearFDS}
          onCheckedChange={(v) =>
            handleToggle('bloquear_finais_de_semana', v, setBloquearFDS)
          }
          disabled={isTecnico}
        />

        <ToggleRow
          id="bloquear-os-contrato"
          label="Bloquear abertura de OS (Contrato não assinado)"
          description="Impede a criação de Ordens de Serviço se a Situação do Contrato do cliente não estiver como 'Assinado'."
          checked={bloquearOsContratoNaoAssinado}
          onCheckedChange={(v) =>
            handleToggle('bloquear_os_contrato_nao_assinado', v, setBloquearOsContratoNaoAssinado)
          }
          disabled={isTecnico}
        />

        <div className="flex items-center justify-between gap-6 py-3 border-t border-border/50">
          <div className="space-y-0.5 flex-1">
            <Label htmlFor="comportamento-retroativo" className="text-sm font-medium text-text">
              Agendamento Retroativo
            </Label>
            <p className="text-xs text-muted-foreground max-w-xl">
              Define o comportamento do sistema quando uma ordem de serviço for agendada para uma data passada.
            </p>
          </div>
          <div className="w-[300px] flex justify-end">
            <Select
              value={comportamentoRetroativo}
              onValueChange={handleRetroativoChange}
              disabled={isTecnico}
            >
              <SelectTrigger id="comportamento-retroativo">
                <SelectValue placeholder="Selecione o comportamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aviso">Avisar</SelectItem>
                <SelectItem value="permitir">Permitir</SelectItem>
                <SelectItem value="bloquear">Bloquear</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Seção: Horário de Atendimento */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
        <SectionHeader
          icon={Clock}
          title="Horário de Atendimento"
          description="Define o expediente da empresa. OS fora deste horário não poderão ser agendadas. Deixe em branco para não restringir por horário."
        />

        <div className="space-y-4">
          {/* Jornada de Trabalho */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Jornada de Trabalho
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horario-entrada" className="text-sm">
                  Entrada
                </Label>
                <Input
                  id="horario-entrada"
                  type="time"
                  className="max-w-[140px]"
                  value={horario.entrada}
                  onChange={(e) =>
                    setHorario((h) => ({ ...h, entrada: e.target.value }))
                  }
                  disabled={isTecnico}
                  placeholder="08:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horario-saida" className="text-sm">
                  Saída
                </Label>
                <Input
                  id="horario-saida"
                  type="time"
                  className="max-w-[140px]"
                  value={horario.saida}
                  onChange={(e) =>
                    setHorario((h) => ({ ...h, saida: e.target.value }))
                  }
                  disabled={isTecnico}
                  placeholder="17:00"
                />
              </div>
            </div>
          </div>

          {/* Intervalo de Almoço */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5" /> Intervalo de Almoço{' '}
              <span className="normal-case font-normal text-muted-foreground/70">
                — opcional
              </span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horario-inicio-intervalo" className="text-sm">
                  Início do Intervalo
                </Label>
                <Input
                  id="horario-inicio-intervalo"
                  type="time"
                  className="max-w-[140px]"
                  value={horario.inicioIntervalo}
                  onChange={(e) =>
                    setHorario((h) => ({ ...h, inicioIntervalo: e.target.value }))
                  }
                  disabled={isTecnico}
                  placeholder="12:00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horario-fim-intervalo" className="text-sm">
                  Fim do Intervalo
                </Label>
                <Input
                  id="horario-fim-intervalo"
                  type="time"
                  className="max-w-[140px]"
                  value={horario.fimIntervalo}
                  onChange={(e) =>
                    setHorario((h) => ({ ...h, fimIntervalo: e.target.value }))
                  }
                  disabled={isTecnico}
                  placeholder="13:00"
                />
              </div>
            </div>

            {/* Preview do horário configurado */}
            {horario.entrada && horario.saida && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-2">
                <CalendarOff className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span>
                  Expediente:{' '}
                  <strong className="text-text">{horario.entrada} – {horario.inicioIntervalo || horario.saida}</strong>
                  {horario.inicioIntervalo && horario.fimIntervalo && (
                    <>
                      {' '}| Almoço:{' '}
                      <strong className="text-text">
                        {horario.inicioIntervalo} – {horario.fimIntervalo}
                      </strong>
                      {' '}| Retorno:{' '}
                      <strong className="text-text">{horario.fimIntervalo} – {horario.saida}</strong>
                    </>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {!isTecnico && (
          <div className="flex justify-end pt-2 border-t border-border">
            <DefaultButton
              label="Salvar Horário"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSaveHorario}
              isLoading={isSavingHorario}
              className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
            />
          </div>
        )}
      </div>

      {/* Seção: Cadastro de Clientes */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-1">
        <SectionHeader
          icon={Users}
          title="Cadastro de Clientes"
          description="Regras de obrigatoriedade e validação no formulário de clientes."
        />

        <ToggleRow
          id="obrigar-telefone"
          label="Obrigar preenchimento de Telefone"
          description="Torna o campo de telefone obrigatório na criação e edição de clientes."
          checked={obrigarTelefone}
          onCheckedChange={(v) =>
            handleToggle('obrigar_telefone', v, setObrigarTelefone)
          }
          disabled={isTecnico}
        />

        <ToggleRow
          id="obrigar-cpf-cnpj"
          label="Obrigar preenchimento de CPF/CNPJ"
          description="Torna o campo de documento obrigatório."
          checked={obrigarCpfCnpj}
          onCheckedChange={(v) => {
            handleToggle('obrigar_cpf_cnpj', v, setObrigarCpfCnpj)
            if (!v && validarCpfCnpj) {
              handleToggle('validar_cpf_cnpj', false, setValidarCpfCnpj)
            }
          }}
          disabled={isTecnico}
        />

        <ToggleRow
          id="validar-cpf-cnpj"
          label="Validar veracidade do CPF/CNPJ"
          description="Verifica os dígitos verificadores para impedir a inserção de CPFs inválidos (ex: 111.111.111-11)."
          checked={validarCpfCnpj}
          onCheckedChange={(v) =>
            handleToggle('validar_cpf_cnpj', v, setValidarCpfCnpj)
          }
          disabled={isTecnico || !obrigarCpfCnpj}
        />
      </div>
    </div>
  )
}