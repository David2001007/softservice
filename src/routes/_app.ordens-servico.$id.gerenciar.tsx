import { createFileRoute } from '@tanstack/react-router'
import { getOrdemServico } from '@/features/ordens-servico/server'
import { getTecnicos } from '@/features/tecnicos/server'
import { getMateriais } from '@/features/materiais/server'
import { getConfiguracoes } from '@/features/configuracoes/server'
import { GerenciarOSPage } from '@/features/ordens-servico/gerenciar'

export const Route = createFileRoute('/_app/ordens-servico/$id/gerenciar')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [os, tecnicos, materiais, configuracoes] = await Promise.all([
      getOrdemServico({ data: Number(params.id) }),
      getTecnicos(),
      getMateriais(),
      getConfiguracoes(),
    ])
    return { os, tecnicos, materiais, configuracoes }
  },
})

function RouteComponent() {
  const { os, tecnicos, materiais, configuracoes } = Route.useLoaderData()

  if (!os) {
    return null
  }

  return (
    <GerenciarOSPage
      os={os}
      tecnicos={tecnicos}
      materiais={materiais}
      configuracoes={configuracoes}
    />
  )
}
