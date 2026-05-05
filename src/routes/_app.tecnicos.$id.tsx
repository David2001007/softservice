// Stubs para rotas de edição de técnicos, OS, materiais e atendentes
// Cada um segue o mesmo padrão: mostrar formulário pré-populado

import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'

export const Route = createFileRoute('/_app/tecnicos/$id')({
  component: VerTecnicoPage,
})

function VerTecnicoPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/_app/tecnicos/$id' })
  return (
    <div className="max-w-2xl mx-auto fade-in">
      <PageHeader title={`Técnico #${id}`} action={
        <div className="flex gap-2">
          <DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/tecnicos' })} />
          <DefaultButton label="Editar" onClick={() => navigate({ to: '/tecnicos/$id/editar', params: { id } })} className="bg-primary hover:bg-primary-hover text-white" />
        </div>
      } />
      <div className="bg-surface border border-border rounded-xl p-5 mt-5 grid grid-cols-2 gap-4">
        {[['Código', 'TEC-001'], ['Nome', 'Carlos Mendes'], ['Tipo', 'Interno'], ['Perfil', 'Técnico'], ['Telefone', '(44) 99988-0001'], ['Região', 'Maringá Norte'], ['Especialidade', 'Instalação'], ['Status', 'Ativo']].map(([k, v]) => (
          <div key={k}><p className="text-xs text-text-muted">{k}</p><p className="text-sm text-text mt-0.5">{v}</p></div>
        ))}
      </div>
    </div>
  )
}
