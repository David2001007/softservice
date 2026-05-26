import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Settings } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'
import { StatusBadge } from '@/components/status-badge'

export function VerOrdemServicoPage({ os, id }: { os: any; id: string }) {
  const navigate = useNavigate()

  if (!os) return null

  const details = {
    'Número OS': os.numero,
    'Cliente': typeof os.cliente === 'object' ? os.cliente?.nome : os.cliente,
    'CPF/CNPJ': os.cpfCnpj || (typeof os.cliente === 'object' ? os.cliente?.cpfCnpj : ''),
    'Endereço': os.endereco || (typeof os.cliente === 'object' ? `${os.cliente?.logradouro || ''}, ${os.cliente?.numero || ''}` : ''),
    'Tipo de Serviço': os.tipoServico,
    'Prioridade': os.prioridade,
    'Abertura': os.dataAbertura ? new Date(os.dataAbertura).toLocaleString('pt-BR') : '-',
    'Agendamento': os.dataAgendada ? new Date(os.dataAgendada).toLocaleString('pt-BR') : 'Não agendado',
    'Técnico': typeof os.tecnico === 'object' ? os.tecnico?.nome : (os.tecnico || 'Não atribuído'),
    'Status': <StatusBadge value={os.status} type="os" />,
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Ordem de Serviço #${os.numero}`}
        action={
          <div className="flex gap-2">
            <DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/ordens-servico' })} />
            <Link to="/ordens-servico/$id/gerenciar" params={{ id }}>
              <DefaultButton
                label="Gerenciar OS"
                leftIcon={<Settings className="w-4 h-4" />}
                className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
              />
            </Link>
          </div>
        }
      />
      
      <div className="bg-surface border border-border rounded-xl p-5 mb-5">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 border-b border-border pb-2">Descrição do Problema</h3>
        <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{os.descricaoProblema}</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {Object.entries(details).map(([k, v]) => (
          <div key={k}>
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{k}</p>
            <div className="text-sm text-text mt-0.5">{v || '-'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
