import { createFileRoute } from '@tanstack/react-router'
import { getOrdemServico } from '@/features/ordens-servico/server'
import { getTecnicos } from '@/features/tecnicos/server'
import { getMateriais } from '@/features/materiais/server'
import { GerenciarOSPage } from '@/features/ordens-servico/gerenciar'

export const Route = createFileRoute('/_app/ordens-servico/$id/gerenciar')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [os, tecnicos, materiais] = await Promise.all([
      getOrdemServico({ data: Number(params.id) }),
      getTecnicos(),
      getMateriais(),
    ])
    return { os, tecnicos, materiais }
  },
})

function RouteComponent() {
  const { os, tecnicos, materiais } = Route.useLoaderData()
  const { id } = Route.useParams()
  return (
    <GerenciarOSPage
      os={os}
      id={id}
      tecnicos={tecnicos}
      materiais={materiais}
    />
  )
}
