import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { Plus, Settings2, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { AccordionFilters } from '@/components/accordion-filters'
import { DefaultTable  } from '@/components/default-table'
import type {Column} from '@/components/default-table';
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
import { deleteOrdemServico } from '@/features/ordens-servico/server'

const tipoServicoLabel: Record<string, string> = {
  instalacao: 'Instalação',
  manutencao: 'Manutenção',
  troca_equipamento: 'Troca de Equip.',
  infra: 'Infra',
  outro: 'Outro',
}

interface OrdensServicoPageProps {
  ordens: any[]
}

export function OrdensServicoPage({ ordens }: OrdensServicoPageProps) {
  const router = useRouter()
  const [filtros, setFiltros] = useState({
    numero: '',
    cliente: '',
    tecnico: '',
    status: '',
    tipoServico: '',
  })
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number
    numero: string
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteOrdemServico({ data: deleteTarget.id })
      toast.success(`OS "${deleteTarget.numero}" excluída com sucesso!`)
      setDeleteTarget(null)
      router.invalidate()
    } catch {
      toast.error('Erro ao excluir OS')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<any>[] = [
    {
      header: 'Nº OS',
      cell: (r) => (
        <span className="font-mono text-yellow-600 text-xs font-semibold">
          {r.numero}
        </span>
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
      header: 'Agendada',
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
    (o: any) =>
      (!filtros.numero ||
        o.numero.toLowerCase().includes(filtros.numero.toLowerCase())) &&
      (!filtros.cliente ||
        o.cliente?.nome
          .toLowerCase()
          .includes(filtros.cliente.toLowerCase())) &&
      (!filtros.tecnico ||
        o.tecnico?.nome
          .toLowerCase()
          .includes(filtros.tecnico.toLowerCase())) &&
      (!filtros.status || o.status === filtros.status) &&
      (!filtros.tipoServico || o.tipoServico === filtros.tipoServico),
  )

  return (
    <div className="space-y-5 fade-in">
      <PageHeader
        title="Lista de Ordens de Serviço"
        subtitle="Gerenciamento de todas as OS"
        action={
          <Link to="/ordens-servico/nova">
            <DefaultButton
              label="Nova OS"
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
            />
          </Link>
        }
      />

      <AccordionFilters>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <Label className="text-xs">Status</Label>
            <Select
              value={filtros.status}
              onValueChange={(value) =>
                setFiltros((f) => ({ ...f, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
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
            <Label className="text-xs">Tipo de Serviço</Label>
            <Select
              value={filtros.tipoServico}
              onValueChange={(value) =>
                setFiltros((f) => ({ ...f, tipoServico: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="instalacao">Instalação</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="troca_equipamento">
                  Troca de Equipamento
                </SelectItem>
                <SelectItem value="infra">Infra</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
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
