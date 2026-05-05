import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DefaultButton } from '@/components/default-button'

export const Route = createFileRoute('/_app/materiais/$id')({
  component: VerMaterialPage,
})

function VerMaterialPage() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/_app/materiais/$id' })
  return (
    <div className="max-w-xl mx-auto fade-in">
      <PageHeader title={`Material #${id}`} action={
        <div className="flex gap-2">
          <DefaultButton variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} label="Voltar" onClick={() => navigate({ to: '/materiais' })} />
          <DefaultButton label="Editar" onClick={() => navigate({ to: '/materiais/$id/editar', params: { id } })} className="bg-primary hover:bg-primary-hover text-white" />
        </div>
      } />
      <div className="bg-surface border border-border rounded-xl p-5 mt-5 grid grid-cols-2 gap-4">
        {[['Código', 'MAT-001'], ['Descrição', 'Cabo de fibra óptica SC/UPC'], ['Categoria', 'Fibra'], ['Unidade', 'metro'], ['Quantidade', '250'], ['Est. Mínimo', '100'], ['Comodato', 'Não'], ['Status', 'Ativo']].map(([k, v]) => (
          <div key={k}><p className="text-xs text-text-muted">{k}</p><p className="text-sm text-text mt-0.5">{v}</p></div>
        ))}
      </div>
    </div>
  )
}
