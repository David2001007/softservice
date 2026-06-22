import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  CheckCircle2,
  CalendarClock,
  XCircle,
  History,
  Lock,
  Upload,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { StatusBadge } from '@/components/status-badge'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import type {OsConclusaoInput, OsReagendamentoInput, OsCancelamentoInput, OsSchema} from '@/features/ordens-servico/schema';
import {
  concluirOrdemServico,
  reagendarOrdemServico,
  cancelarOrdemServico,
} from '@/features/ordens-servico/server'
import { ConclusaoForm } from './conclusao'
import { ReagendamentoForm } from './reagendamento'
import { CancelamentoForm } from './cancelamento'
import { Historico } from './historico'
import { ArquivoUploadModal } from '../components/ArquivoUploadModal'
import { ArquivoList } from '../components/ArquivoList'

type Tab = 'conclusao' | 'reagendamento' | 'cancelamento' | 'historico'

interface GerenciarOSPageProps {
  os: OsSchema & { 
    id: number | string
    numero?: string
    cliente?: { nome?: string; logradouro?: string; cidade?: string }
    tecnico?: { nome?: string }
    dataAbertura: string
    historico?: any[]
    arquivos?: any[]
  }
  materiais: Array<{ id: number; codigo: string; descricao: string }>
  tecnicos: Array<{ id: number; nome: string }>
}

const TABS = [
  { id: 'conclusao' as const, label: 'Conclusão', icon: CheckCircle2 },
  { id: 'reagendamento' as const, label: 'Reagendamento', icon: CalendarClock },
  { id: 'cancelamento' as const, label: 'Cancelamento', icon: XCircle },
  { id: 'historico' as const, label: 'Histórico', icon: History },
]

// Clear cache for the given OS id
function clearCache(osId: number | string) {
  const keysToRemove = [
    `os-gerenciar-conclusao-${osId}`,
    `os-gerenciar-reagendamento-${osId}`,
    `os-gerenciar-cancelamento-${osId}`,
  ]
  keysToRemove.forEach((key) => localStorage.removeItem(key))
}

export function GerenciarOSPage({
  os,
  materiais,
  tecnicos,
}: GerenciarOSPageProps) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<Tab>('conclusao')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [arquivos, setArquivos] = useState(os.arquivos || [])

  // Clear cache when component unmounts (leaving the page)
  useEffect(() => {
    return () => {
      clearCache(os.id)
    }
  }, [os.id])

  if (!os) return null

  // Verificar permissões para editar OS canceladas/concluídas
  const canEditLockedOS =
    user?.role === 'admin' ||
    user?.role === 'atendente' ||
    user?.role === 'supervisor'
  const isOSLocked = os.status === 'cancelada' || os.status === 'concluida'
  const canEdit = !isOSLocked || canEditLockedOS

  const handleConcluir = async (data: OsConclusaoInput) => {
    try {
      setIsLoading(true)
      await concluirOrdemServico({ data: { id: Number(os.id), data } })
      toast.success('OS concluída e materiais baixados com sucesso!')
      await navigate({ to: '/ordens-servico' })
    } catch (e) {
      toast.error('Erro ao concluir OS')
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReagendar = async (data: OsReagendamentoInput) => {
    try {
      setIsLoading(true)
      await reagendarOrdemServico({ data: { id: Number(os.id), data } })
      toast.success('OS reagendada com sucesso!')
      await navigate({ to: '/ordens-servico' })
    } catch (e) {
      toast.error('Erro ao reagendar OS')
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelar = async (data: OsCancelamentoInput) => {
    try {
      setIsLoading(true)
      await cancelarOrdemServico({ data: { id: Number(os.id), data } })
      toast.success('OS cancelada.')
      await navigate({ to: '/ordens-servico' })
    } catch (e) {
      toast.error('Erro ao cancelar OS')
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-0 space-y-5 fade-in">
      <PageHeader
        title="Gerenciador de Ordem de Serviço"
        action={
          <DefaultButton
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            label="Voltar"
            onClick={() => navigate({ to: '/ordens-servico' })}
          />
        }
      />

      {/* Cabeçalho da OS */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <span className="font-mono text-xl font-bold text-yellow-600">
            {os.numero}
          </span>
          <StatusBadge value={os.status || ''} type="os" />
          <StatusBadge value={os.prioridade || ''} type="prioridade" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
          {[
            { label: 'Cliente', value: os.cliente?.nome },
            {
              label: 'Endereço',
              value: `${os.cliente?.logradouro || ''} — ${os.cliente?.cidade || ''}`,
            },
            { label: 'Tipo de Serviço', value: os.tipoServico },
            { label: 'Técnico Responsável', value: os.tecnico?.nome },
            {
              label: 'Data de Abertura',
              value: formatDate(new Date(os.dataAbertura)),
            },
            {
              label: 'Data Agendada',
              value: os.dataAgendada
                ? formatDate(new Date(os.dataAgendada), { time: true })
                : '-',
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground font-medium">
                {label}
              </p>
              <p className="text-sm mt-0.5 break-words">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Arquivos */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
              Arquivos Anexados ({arquivos.length}/5)
            </h3>
          </div>
          {canEdit && arquivos.length < 5 && (
            <DefaultButton
              label="Adicionar Arquivo"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => setUploadModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white w-full sm:w-auto"
            />
          )}
        </div>
        <ArquivoList
          arquivos={arquivos}
          showDelete={canEdit}
          onArquivoDeleted={(deletedId) => {
            // Refresh files
            setArquivos(arquivos.filter((a: any) => a.id !== deletedId))
          }}
        />
      </div>

      {/* Aviso de OS Bloqueada */}
      {isOSLocked && !canEditLockedOS && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-warning mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-warning">
              Ordem de Serviço Bloqueada
            </p>
            <p className="text-xs text-warning/80 mt-1">
              Apenas admin, atendente e supervisor podem editar OS canceladas ou
              concluídas.
            </p>
          </div>
        </div>
      )}

      {/* Abas */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isEditTab = id !== 'historico'
            const isDisabled = isEditTab && isOSLocked && !canEditLockedOS

            return (
              <button
                key={id}
                onClick={() => !isDisabled && setActiveTab(id)}
                disabled={isDisabled}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  isDisabled
                    ? 'cursor-not-allowed opacity-50 border-transparent text-muted-foreground'
                    : activeTab === id
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title={isDisabled ? 'Esta aba não pode ser editada' : undefined}
              >
                <Icon className="w-4 h-4" />
                {label}
                {isDisabled && <Lock className="w-3 h-3 ml-1" />}
              </button>
            )
          })}
        </div>

        <div className="p-5">
          {!canEdit && activeTab !== 'historico' && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
              <p className="text-sm text-destructive">
                Você não tem permissão para editar esta ordem de serviço.
              </p>
            </div>
          )}

          {activeTab === 'conclusao' && canEdit && (
            <ConclusaoForm
              osId={os.id}
              onSubmit={handleConcluir}
              isLoading={isLoading}
              materiaisCatalogo={materiais}
            />
          )}

          {activeTab === 'reagendamento' && canEdit && (
            <ReagendamentoForm
              osId={os.id}
              onSubmit={handleReagendar}
              isLoading={isLoading}
              dataAgendadaAtual={os.dataAgendada}
              tecnicoNomeAtual={os.tecnico?.nome}
              tecnicos={tecnicos}
            />
          )}

          {activeTab === 'cancelamento' && canEdit && (
            <CancelamentoForm 
              osId={os.id}
              onSubmit={handleCancelar} 
              isLoading={isLoading} 
            />
          )}

          {activeTab === 'historico' && (
            <Historico historico={os.historico || []} />
          )}
        </div>
      </div>

      <ArquivoUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        osId={Number(os.id)}
        onUploadSuccess={(arquivosAtualizados) => {
          setArquivos(arquivosAtualizados)
        }}
      />
    </div>
  )
}
