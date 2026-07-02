import { useState } from 'react'
import { Link, useRouter, useSearch } from '@tanstack/react-router'
import { Plus, Settings2, Pencil, Trash2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { AccordionFilters } from '@/components/accordion-filters'
import { DefaultTable  } from '@/components/default-table'
import type {Column} from '@/components/default-table';
import { CopyableOsNumber } from '@/components/copyable-os-number'
import { DefaultButton } from '@/components/default-button'
import { StatusBadge } from '@/components/status-badge'
import { DeleteConfirmationModal } from '@/components/delete-confirmation-modal'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { deleteOrdemServico } from '@/features/ordens-servico/server'
import { OrdemServicoCardList } from './components/OrdemServicoCardList'

const tipoServicoLabel: Record<string, string> = {
  instalacao: 'Instalação',
  manutencao: 'Manutenção',
  troca_equipamento: 'Troca de Equipamento',
  infra: 'Infraestrutura',
  outro: 'Outro',
}

interface OrdensServicoPageProps {
  ordens: any[]
}

export function OrdensServicoPage({ ordens }: OrdensServicoPageProps) {
  const router = useRouter()
  const search: any = useSearch({ strict: false })
  
  const [filtros, setFiltros] = useState({
    numero: '',
    cliente: '',
    tecnico: '',
    tipoServico: '',
    dataInicial: search.dataInicial || '',
    dataFinal: search.dataFinal || '',
  })
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number
    numero: string
  } | null>(null)
  
  const initialStatuses = search.status ? search.status.split(',') : []
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialStatuses)
  const [isDeleting, setIsDeleting] = useState(false)
  const user = useAuthStore((s) => s.user)
  const isTecnico = user?.type === 'tecnico'

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteOrdemServico({ data: deleteTarget.id })
      toast.success(
        <span>
          OS <CopyableOsNumber numero={deleteTarget.numero} asQuotes /> excluída com sucesso!
        </span>,
        { duration: 5000 }
      )
      setDeleteTarget(null)
      router.invalidate()
    } catch {
      toast.error('Erro ao excluir OS')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleStatus = (st: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(st) ? prev.filter((p) => p !== st) : [...prev, st],
    )
  }

  const statusOptions = [
    { id: 'aberta', label: 'Aberta', activeClass: 'bg-info/15 text-info border-info/50 shadow-sm shadow-info/20 ring-1 ring-info/30' },
    { id: 'agendada', label: 'Agendada', activeClass: 'bg-primary/15 text-primary border-primary/50 shadow-sm shadow-primary/20 ring-1 ring-primary/30' },
    { id: 'em_execucao', label: 'Em Execução', activeClass: 'bg-warning/15 text-warning border-warning/50 shadow-sm shadow-warning/20 ring-1 ring-warning/30' },
    { id: 'pendente', label: 'Pendente', activeClass: 'bg-text-muted/15 text-text-muted border-text-muted/50 shadow-sm ring-1 ring-text-muted/30' },
    { id: 'concluida', label: 'Concluída', activeClass: 'bg-success/15 text-success border-success/50 shadow-sm shadow-success/20 ring-1 ring-success/30' },
    { id: 'cancelada', label: 'Cancelada', activeClass: 'bg-danger/15 text-danger border-danger/50 shadow-sm shadow-danger/20 ring-1 ring-danger/30' },
    { id: 'reagendada', label: 'Reagendada', activeClass: 'bg-gold/15 text-gold border-gold/50 shadow-sm shadow-gold/20 ring-1 ring-gold/30' },
    { id: 'atrasada', label: 'Em Atraso', activeClass: 'bg-danger/10 text-danger border-danger/50 border-dashed shadow-sm shadow-danger/20 ring-1 ring-danger/30' },
  ]

  const columns: Column<any>[] = [
    {
      header: 'Nº OS',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-yellow-600 text-xs font-semibold">
            {r.numero}
          </span>
          {(r.arquivos || []).length > 0 && (
            <div className="flex items-center gap-1 text-blue-500" title={`${(r.arquivos || []).length} arquivo(s) anexado(s)`}>
              <FileText className="w-3 h-3" />
              <span className="text-xs">{(r.arquivos || []).length}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Abertura',
      cell: (r) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(new Date(r.dataAbertura))}
        </span>
      ),
    },
    { header: 'Cliente', cell: (r) => r.cliente?.nome || '-' },
    {
      header: 'Cidade',
      cell: (r) => r.cliente?.cidade || '-',
      className: 'text-muted-foreground text-sm',
    },
    {
      header: 'Tipo',
      cell: (r) => (
        <span className="text-sm">
          {tipoServicoLabel[r.tipoServico] ?? r.tipoServico}
        </span>
      ),
    },
    {
      header: 'Técnico',
      cell: (r) => r.tecnico?.nome || '-',
      className: 'text-muted-foreground text-sm',
    },
    {
      header: 'Data/Hora Agendada',
      cell: (r) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {r.dataAgendada
            ? formatDate(new Date(r.dataAgendada), { time: true })
            : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (r) => <StatusBadge value={r.status} type="os" />,
    },
    {
      header: 'Ações',
      cell: (r) => (
        <div className="flex items-center gap-1">
          <Link
            to="/ordens-servico/$id/gerenciar"
            params={{ id: String(r.id) }}
          >
            <DefaultButton
              size="sm"
              leftIcon={<Settings2 className="w-3.5 h-3.5" />}
              label="Gerenciar"
              className="h-7 text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
            />
          </Link>
          <Link to="/ordens-servico/$id/editar" params={{ id: String(r.id) }}>
            <DefaultButton
              size="sm"
              variant="ghost"
              leftIcon={<Pencil className="w-3.5 h-3.5" />}
              label="Editar"
              className="h-7 text-xs"
            />
          </Link>
          <DefaultButton
            size="sm"
            variant="ghost"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            label="Excluir"
            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteTarget({ id: r.id, numero: r.numero })}
          />
        </div>
      ),
    },
  ]

  const filtered = ordens.filter(
    (o: any) => {
      // Filtros de texto/select
      if (filtros.numero && !o.numero.toLowerCase().includes(filtros.numero.toLowerCase())) return false;
      if (filtros.cliente && !o.cliente?.nome.toLowerCase().includes(filtros.cliente.toLowerCase())) return false;
      if (filtros.tecnico && !o.tecnico?.nome.toLowerCase().includes(filtros.tecnico.toLowerCase())) return false;
      if (filtros.tipoServico && o.tipoServico !== filtros.tipoServico) return false;

      // Filtros de Data de Criação (Abertura)
      if (filtros.dataInicial) {
        const osDate = new Date(o.dataAbertura).toISOString().split('T')[0]
        if (osDate < filtros.dataInicial) return false
      }
      if (filtros.dataFinal) {
        const osDate = new Date(o.dataAbertura).toISOString().split('T')[0]
        if (osDate > filtros.dataFinal) return false
      }

      // Filtros de Status Visual
      if (selectedStatuses.length > 0) {
        const isAtrasada =
        (o.status === 'agendada' || o.status === 'reagendada') &&
        o.dataAgendada &&
        new Date(o.dataAgendada) < new Date();
        
        const hasAtrasadaSelected = selectedStatuses.includes('atrasada');
        const hasStatusSelected = selectedStatuses.includes(o.status);

        if (isAtrasada) {
          if (!hasAtrasadaSelected) return false;
        } else {
          if (!hasStatusSelected) return false;
        }
      }

      return true;
    }
  )

  return (
    <div className="px-4 sm:px-0 space-y-5 fade-in">
      <PageHeader
        title="Lista de Ordens de Serviço"
        subtitle={isTecnico ? 'Minhas Ordens de Serviço' : 'Gerenciamento de todas as OS'}
        action={
          !isTecnico ? (
            <Link to="/ordens-servico/nova">
              <DefaultButton
                label="Nova OS"
                leftIcon={<Plus className="w-4 h-4" />}
                className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20 w-full sm:w-auto"
              />
            </Link>
          ) : undefined
        }
      />

      {/* Filtro Visual de Status */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <button
          onClick={() => setSelectedStatuses([])}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            selectedStatuses.length === 0
              ? 'bg-primary text-white border-primary shadow-md'
              : 'bg-surface text-text-muted border-border hover:border-primary/40 hover:text-text'
          }`}
        >
          Todos
        </button>
        {statusOptions.map((opt) => {
          const isActive = selectedStatuses.includes(opt.id)
          return (
            <button
              key={opt.id}
              onClick={() => toggleStatus(opt.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isActive
                  ? opt.activeClass
                  : 'bg-surface text-text-muted border-border hover:bg-surface-hover hover:text-text'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {isTecnico ? (
        <OrdemServicoCardList data={filtered} />
      ) : (
        <>
          <AccordionFilters defaultOpen={!!(search.status || search.dataInicial || search.dataFinal)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
          <div className="space-y-2">
            <Label className="text-xs">Nº OS</Label>
            <Input
              value={filtros.numero}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, numero: e.target.value }))
              }
              placeholder="OS-001..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Cliente</Label>
            <Input
              value={filtros.cliente}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, cliente: e.target.value }))
              }
              placeholder="Nome do cliente..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Técnico</Label>
            <Input
              value={filtros.tecnico}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, tecnico: e.target.value }))
              }
              placeholder="Nome do técnico..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Tipo de Serviço</Label>
            <Select
              value={filtros.tipoServico || 'todos'}
              onValueChange={(value) =>
                setFiltros((f) => ({ ...f, tipoServico: value === 'todos' ? '' : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="instalacao">Instalação</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="troca_equipamento">
                  Troca de Equipamento
                </SelectItem>
                <SelectItem value="infra">Infraestrutura</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Data Inicial</Label>
            <Input
              type="date"
              value={filtros.dataInicial}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, dataInicial: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Data Final</Label>
            <Input
              type="date"
              value={filtros.dataFinal}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, dataFinal: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <DefaultButton 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setFiltros({
                  numero: '',
                  cliente: '',
                  tecnico: '',
                  tipoServico: '',
                  dataInicial: '',
                  dataFinal: '',
                })
                setSelectedStatuses([])
                router.navigate({ to: '/ordens-servico', search: {} })
              }}
            >
              Limpar Todos
            </DefaultButton>
          </div>
        </div>
      </AccordionFilters>

          <DefaultTable
            columns={columns}
            data={filtered.slice((page - 1) * 10, page * 10)}
            emptyMessage="Nenhuma ordem de serviço encontrada"
            pagination={{
              currentPage: page,
              totalPages: Math.ceil(filtered.length / 10),
              totalItems: filtered.length,
              onPageChange: setPage,
            }}
          />
        </>
      )}

      <DeleteConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir Ordem de Serviço"
        description={`Tem certeza que deseja excluir a OS "${deleteTarget?.numero}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  )
}
