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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { osSchema  } from '@/features/ordens-servico/schema'
import type {OsInput} from '@/features/ordens-servico/schema';
import { createOrdemServico } from '@/features/ordens-servico/server'
import { getClientes } from '@/features/clientes/server'
import { getTecnicos } from '@/features/tecnicos/server'
import { cn } from '@/lib/utils'

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

interface NovaOrdemServicoPageProps {
  clientes: any[]
  tecnicos: any[]
}

export function NovaOrdemServicoPage({
  clientes,
  tecnicos,
}: NovaOrdemServicoPageProps) {
  const navigate = useNavigate()
  const [searchCliente, setSearchCliente] = useState('')
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
    defaultValues: { prioridade: 'normal', status: 'aberta' },
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

  const numeroOs = `OS${new Date().getFullYear()}${Math.floor(
    Math.random() * 10000,
  )
    .toString()
    .padStart(4, '0')}`

  const handleSelectCliente = (cliente: any) => {
    setValue('clienteId', cliente.id)
    setSearchCliente(cliente.nome)
    setOpenClienteList(false)
  }

  const handleClearCliente = () => {
    setValue('clienteId', undefined)
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
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
              <Input
                value={new Date().toLocaleDateString('pt-BR')}
                readOnly
                disabled
              />
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
                          {c.telefone}
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
            </div>
            <div className="space-y-2">
              <Label>Telefone de Contato</Label>
              <Input
                value={clienteSelecionado?.telefone ?? ''}
                readOnly
                disabled
                placeholder="Selecione um cliente"
              />
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

        {/* Serviço */}
        <FormSection title="Detalhes do Serviço">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoServico">Tipo de Serviço *</Label>
              <Select
                onValueChange={(value) => setValue('tipoServico', value as any)}
              >
                <SelectTrigger
                  id="tipoServico"
                  aria-invalid={!!errors.tipoServico}
                >
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instalacao">Instalação</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="troca_equipamento">
                    Troca de Equipamento
                  </SelectItem>
                  <SelectItem value="infra">Infra</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipoServico && (
                <p className="text-xs text-destructive">
                  {errors.tipoServico.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                defaultValue="normal"
                onValueChange={(value) => setValue('prioridade', value as any)}
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
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="descricao">
                Descrição do Problema / Solicitação
              </Label>
              <Textarea
                id="descricao"
                {...register('descricaoProblema')}
                placeholder="Descreva o problema ou a solicitação do cliente..."
                rows={3}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="observacoes">Observações Gerais</Label>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataAgendada">Data / Hora Agendada</Label>
              <Input
                id="dataAgendada"
                type="datetime-local"
                {...register('dataAgendada')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tecnico">Técnico Responsável</Label>
              <Select
                onValueChange={(value) =>
                  setValue('tecnicoId', value ? Number(value) : undefined)
                }
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
          </div>
        </FormSection>

        <div className="flex items-center justify-end gap-3 pt-2">
          <DefaultButton
            variant="ghost"
            label="Cancelar"
            onClick={() => navigate({ to: '/ordens-servico' })}
          />
          <DefaultButton
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<Save className="w-4 h-4" />}
            label="Criar Ordem de Serviço"
            className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
          />
        </div>
      </form>
    </div>
  )
}
