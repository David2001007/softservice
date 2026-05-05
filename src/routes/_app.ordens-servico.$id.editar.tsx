import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'

export const Route = createFileRoute('/_app/ordens-servico/$id/editar')({
  component: EditarOsPage,
})

function EditarOsPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/_app/ordens-servico/$id/editar' })

  // Para edição de OS, redireciona para o gerenciador pois é onde ocorre a gestão completa
  return (
    <div className="max-w-xl mx-auto space-y-5 fade-in">
      <PageHeader
        title={`Editar OS #${id}`}
        action={<DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/ordens-servico' })} />}
      />
      <div className="bg-surface border border-border rounded-xl p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <span className="text-2xl">📋</span>
        </div>
        <div>
          <p className="font-semibold text-text">OS-00{id}</p>
          <p className="text-sm text-text-muted mt-1">Para gerenciar, concluir, reagendar ou cancelar esta OS, utilize o Gerenciador.</p>
        </div>
        <DefaultButton
          label="Abrir Gerenciador"
          onClick={() => navigate({ to: '/ordens-servico/$id/gerenciar', params: { id } })}
          className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20"
        />
      </div>
    </div>
  )
}
