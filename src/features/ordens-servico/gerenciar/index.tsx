import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Clock, MapPin, User, CheckCircle2, AlertTriangle, FileText, Wrench, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { StatusBadge } from '@/components/status-badge'
import { DefaultTable } from '@/components/default-table'
import type { Column } from '@/components/default-table'
import { DefaultModal } from '@/components/default-modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { getMateriais } from '@/features/materiais/server'
import { concluirOrdemServico, iniciarAtendimento } from '@/features/ordens-servico/server'

type MaterialCatalogItem = {
  id: number
  codigo: string
  descricao: string
  unidade: string
}

type MaterialLancado = {
  id: string
  materialId: number
  codigo: string
  descricao: string
  unidade: string
  quantidade: string
  tipoUso: 'comodato' | 'venda' | 'uso_interno'
  localSaida: 'estoque_principal' | 'estoque_tecnico'
}

export function GerenciarOSPage({ os, id }: { os: any; id: string }) {
  const navigate = useNavigate()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'detalhes' | 'materiais' | 'historico'>('detalhes')
  const [isLoading, setIsLoading] = useState(false)
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false)
  const [isFinalizarOpen, setIsFinalizarOpen] = useState(false)
  const [materiaisCatalogo, setMateriaisCatalogo] = useState<MaterialCatalogItem[]>([])

  const [materialId, setMaterialId] = useState<string>('')
  const [materialQuantidade, setMaterialQuantidade] = useState<string>('1')
  const [materialTipoUso, setMaterialTipoUso] = useState<MaterialLancado['tipoUso']>('uso_interno')
  const [materialLocalSaida, setMaterialLocalSaida] = useState<MaterialLancado['localSaida']>('estoque_principal')

  const [resultadoServico, setResultadoServico] = useState(true)
  const [observacoesFinais, setObservacoesFinais] = useState('')
  const [materiaisLancados, setMateriaisLancados] = useState<MaterialLancado[]>([])

  if (!os) return null

  useEffect(() => {
    const initial: MaterialLancado[] =
      (os.materiais || [])
        .map((m: any) => {
          const material = m.material
          if (!material) return null
          return {
            id: `db-${m.id}`,
            materialId: material.id,
            codigo: material.codigo,
            descricao: material.descricao,
            unidade: material.unidade,
            quantidade: String(m.quantidade ?? '0'),
            tipoUso: m.tipoUso,
            localSaida: m.localSaida,
          } satisfies MaterialLancado
        })
        .filter(Boolean) as MaterialLancado[]

    setMateriaisLancados(initial)
  }, [os.id])

  useEffect(() => {
    if (!isAddMaterialOpen) return

    const cancelledRef = { current: false }
    ;(async () => {
      try {
        const mats = (await getMateriais()) as any[]
        if (cancelledRef.current) return
        setMateriaisCatalogo(mats as MaterialCatalogItem[])
      } catch (e) {
        toast.error('Erro ao carregar materiais')
      }
    })()

    return () => {
      cancelledRef.current = true
    }
  }, [isAddMaterialOpen])

  const handleIniciarAtendimento = async () => {
    try {
      setIsLoading(true)
      await iniciarAtendimento({ data: os.id })
      toast.success('Atendimento iniciado com sucesso!')
      router.invalidate()
    } catch (e) {
      toast.error('Erro ao iniciar atendimento')
    } finally {
      setIsLoading(false)
    }
  }

  // Mocks para demonstração na UI
  const selectedMaterial = useMemo(() => {
    const mid = Number(materialId)
    if (!mid) return null
    return materiaisCatalogo.find((m) => m.id === mid) || null
  }, [materialId, materiaisCatalogo])

  const columnsMateriais: Column<MaterialLancado>[] = [
    { header: 'Código', accessorKey: 'codigo', className: 'font-mono text-xs' },
    { header: 'Descrição', accessorKey: 'descricao' },
    { header: 'Qtd', cell: (r) => `${r.quantidade} ${r.unidade}` },
    {
      header: '',
      headerClassName: 'w-12',
      className: 'text-right',
      cell: (r) => (
        <DefaultButton
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          leftIcon={<Trash2 className="w-4 h-4" />}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setMateriaisLancados((prev) => prev.filter((m) => m.id !== r.id))
          }}
        />
      ),
    },
  ]

  const historicoMock = [
    { data: '2023-10-25 10:00', usuario: 'Atendimento', acao: 'OS Aberta' },
    { data: '2023-10-25 10:15', usuario: 'Técnico 1', acao: 'Deslocamento iniciado' },
  ]

  const handleAddMaterial = () => {
    const mid = Number(materialId)
    if (!mid || !selectedMaterial) {
      toast.error('Selecione um material')
      return
    }

    const qtd = Number(materialQuantidade)
    if (!Number.isFinite(qtd) || qtd <= 0) {
      toast.error('Informe uma quantidade válida')
      return
    }

    setMateriaisLancados((prev) => [
      ...prev,
      {
        id: `tmp-${crypto.randomUUID()}`,
        materialId: mid,
        codigo: selectedMaterial.codigo,
        descricao: selectedMaterial.descricao,
        unidade: selectedMaterial.unidade,
        quantidade: String(materialQuantidade),
        tipoUso: materialTipoUso,
        localSaida: materialLocalSaida,
      },
    ])

    setMaterialId('')
    setMaterialQuantidade('1')
    setMaterialTipoUso('uso_interno')
    setMaterialLocalSaida('estoque_principal')
    setIsAddMaterialOpen(false)
  }

  const handleFinalizar = async () => {
    try {
      setIsLoading(true)

      await concluirOrdemServico({
        data: {
          id: os.id,
          data: {
            dataInicioEfetivo: os.dataInicioEfetivo ? new Date(os.dataInicioEfetivo).toISOString() : new Date().toISOString(),
            dataTerminoEfetivo: new Date().toISOString(),
            resultadoServico,
            observacoesFinais: observacoesFinais || undefined,
            materiais: materiaisLancados.map((m) => ({
              materialId: m.materialId,
              quantidade: m.quantidade,
              tipoUso: m.tipoUso,
              localSaida: m.localSaida,
            })),
          },
        },
      })

      toast.success('OS finalizada com sucesso!')
      setIsFinalizarOpen(false)
      router.invalidate()
    } catch (e) {
      toast.error('Erro ao finalizar OS')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Gerenciar OS #${os.numero}`}
        action={
          <div className="flex gap-2">
            <DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/ordens-servico' })} />
            {os.status === 'aberta' && (
              <DefaultButton label="Iniciar Atendimento" onClick={handleIniciarAtendimento} isLoading={isLoading} className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20" />
            )}
            {(os.status === 'em_execucao' || os.status === 'em_andamento') && (
              <DefaultButton
                label="Finalizar OS"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                className="bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20"
                onClick={() => setIsFinalizarOpen(true)}
              />
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Tabs */}
          <div className="bg-surface border border-border rounded-xl p-1 flex gap-1">
            {[
              { id: 'detalhes', label: 'Detalhes da OS', icon: FileText },
              { id: 'materiais', label: 'Materiais Utilizados', icon: Wrench },
              { id: 'historico', label: 'Histórico', icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-muted hover:bg-surface-hover hover:text-text'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-surface border border-border rounded-xl p-5 min-h-[400px]">
            {activeTab === 'detalhes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Descrição do Problema</h3>
                  <p className="text-sm text-text bg-background border border-border rounded-lg p-4 leading-relaxed">
                    {os.descricaoProblema}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-xs text-text-muted font-medium uppercase mb-1">Abertura</p>
                    <p className="text-sm text-text">{os.dataAbertura ? new Date(os.dataAbertura).toLocaleString('pt-BR') : '-'}</p>
                  </div>
                  <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-xs text-text-muted font-medium uppercase mb-1">Agendamento</p>
                    <p className="text-sm text-text">{os.dataAgendada ? new Date(os.dataAgendada).toLocaleString('pt-BR') : 'Não agendado'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'materiais' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Lançamento de Materiais</h3>
                  <DefaultButton
                    size="sm"
                    variant="outline"
                    label="Adicionar Material"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setIsAddMaterialOpen(true)}
                  />
                </div>
                <DefaultTable columns={columnsMateriais} data={materiaisLancados} emptyMessage="Nenhum material lançado" />
              </div>
            )}

            {activeTab === 'historico' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Histórico de Eventos</h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {historicoMock.map((h, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface bg-primary/20 text-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-background shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-text">{h.acao}</span>
                          <span className="text-xs font-mono text-text-muted">{h.data}</span>
                        </div>
                        <p className="text-xs text-text-muted">Por: {h.usuario}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-5">
          <div className="bg-surface border border-border rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text text-lg">OS #{os.numero}</h3>
              <StatusBadge value={os.status} type="os" />
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-text">{typeof os.cliente === 'object' ? os.cliente?.nome : os.cliente}</p>
                  <p className="text-xs text-text-muted">{os.cpfCnpj || (typeof os.cliente === 'object' ? os.cliente?.cpfCnpj : '')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-text">{os.endereco || (typeof os.cliente === 'object' ? `${os.cliente?.logradouro || ''}, ${os.cliente?.numero || ''}` : '')}</p>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${os.prioridade === 'alta' ? 'text-danger' : os.prioridade === 'media' ? 'text-warning' : 'text-success'}`} />
                <div>
                  <p className="text-sm font-medium text-text">Prioridade {os.prioridade.charAt(0).toUpperCase() + os.prioridade.slice(1)}</p>
                  <p className="text-xs text-text-muted">Tipo: {os.tipoServico}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Técnico Responsável</h3>
            {os.tecnico ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {typeof os.tecnico === 'object' ? os.tecnico?.nome?.charAt(0) : os.tecnico.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-text">{typeof os.tecnico === 'object' ? os.tecnico?.nome : os.tecnico}</p>
                  <p className="text-xs text-text-muted">Deslocamento: 10:15</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-text-muted mb-3">Nenhum técnico atribuído</p>
                <DefaultButton size="sm" variant="outline" label="Atribuir Técnico" className="w-full" />
              </div>
            )}
          </div>
        </div>
      </div>

      <DefaultModal
        open={isAddMaterialOpen}
        onOpenChange={setIsAddMaterialOpen}
        title="Adicionar material"
        description="Selecione o material e informe a quantidade utilizada."
        footer={
          <div className="flex w-full justify-end gap-2">
            <DefaultButton variant="ghost" label="Cancelar" onClick={() => setIsAddMaterialOpen(false)} />
            <DefaultButton label="Adicionar" onClick={handleAddMaterial} />
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Material</Label>
            <Select value={materialId} onValueChange={setMaterialId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {materiaisCatalogo.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.codigo} - {m.descricao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Quantidade</Label>
            <Input inputMode="decimal" value={materialQuantidade} onChange={(e) => setMaterialQuantidade(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label>Tipo de uso</Label>
            <Select value={materialTipoUso} onValueChange={(v) => setMaterialTipoUso(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uso_interno">Uso interno</SelectItem>
                <SelectItem value="comodato">Comodato</SelectItem>
                <SelectItem value="venda">Venda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Local de saída</Label>
            <Select value={materialLocalSaida} onValueChange={(v) => setMaterialLocalSaida(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="estoque_principal">Estoque principal</SelectItem>
                <SelectItem value="estoque_tecnico">Estoque técnico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DefaultModal>

      <DefaultModal
        open={isFinalizarOpen}
        onOpenChange={setIsFinalizarOpen}
        title="Finalizar OS"
        description="Revise os materiais e finalize o atendimento."
        footer={
          <div className="flex w-full justify-end gap-2">
            <DefaultButton variant="ghost" label="Cancelar" onClick={() => setIsFinalizarOpen(false)} />
            <DefaultButton label="Finalizar" isLoading={isLoading} onClick={handleFinalizar} />
          </div>
        }
      >
        <div className="grid gap-5">
          <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
            <div>
              <p className="text-sm font-medium text-text">Serviço concluído com sucesso?</p>
              <p className="text-xs text-text-muted">Marque como sucesso ou falha.</p>
            </div>
            <Switch checked={resultadoServico} onCheckedChange={setResultadoServico} />
          </div>

          <div className="grid gap-2">
            <Label>Observações finais</Label>
            <Textarea value={observacoesFinais} onChange={(e) => setObservacoesFinais(e.target.value)} placeholder="Opcional" />
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-text">Materiais lançados</p>
              <DefaultButton size="sm" variant="outline" label="Adicionar" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsAddMaterialOpen(true)} />
            </div>
            <DefaultTable columns={columnsMateriais} data={materiaisLancados} emptyMessage="Nenhum material lançado" />
          </div>
        </div>
      </DefaultModal>
    </div>
  )
}
