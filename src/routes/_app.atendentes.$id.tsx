import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'

export const Route = createFileRoute('/_app/atendentes/$id')({
  component: VerAtendentePage,
})

function VerAtendentePage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/_app/atendentes/$id' })
  return (
    <div className="max-w-xl mx-auto fade-in">
      <PageHeader title={`Atendente #${id}`} action={
        <div className="flex gap-2">
          <DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/atendentes' })} />
          <DefaultButton label="Editar" onClick={() => navigate({ to: '/atendentes/$id/editar', params: { id } })} className="bg-primary hover:bg-primary-hover text-white" />
        </div>
      } />
      <div className="bg-surface border border-border rounded-xl p-5 mt-5 grid grid-cols-2 gap-4">
        {[['Código', 'ATD-001'], ['Nome', 'Ana Clara Santos'], ['CPF', '123.456.789-01'], ['E-mail', 'ana@softservice.com'], ['Usuário', 'ana.santos'], ['Perfil', 'Admin']].map(([k, v]) => (
          <div key={k}><p className="text-xs text-text-muted">{k}</p><p className="text-sm text-text mt-0.5">{v}</p></div>
        ))}
      </div>
    </div>
  )
}
