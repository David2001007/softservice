import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'

export const Route = createFileRoute('/_app/clientes/$id')({
  component: VerClientePage,
})

function VerClientePage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/_app/clientes/$id' })

  const cliente = {
    codigo: 'CLI-001', nome: 'João da Silva', cpfCnpj: '123.456.789-01',
    telefone: '(44) 99999-0001', cidade: 'Maringá', uf: 'PR',
    logradouro: 'Rua das Flores, 123', bairro: 'Centro', referencia: 'Próximo à praça',
    plano: '100 Mbps', situacaoContrato: 'Assinado', status: 'ativo',
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Cliente #${id}`}
        action={
          <div className="flex gap-2">
            <DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/clientes' })} />
            <DefaultButton label="Editar" onClick={() => navigate({ to: '/clientes/$id/editar', params: { id } })} className="bg-primary hover:bg-primary-hover text-white" />
          </div>
        }
      />
      <div className="bg-surface border border-border rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {Object.entries(cliente).map(([k, v]) => (
          <div key={k}>
            <p className="text-xs text-text-muted font-medium capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
            <p className="text-sm text-text mt-0.5">{v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
