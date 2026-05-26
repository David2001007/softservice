import { createFileRoute } from '@tanstack/react-router'
import { getOrdemServico } from '@/features/ordens-servico/server'
import { GerenciarOSPage } from '@/features/ordens-servico/gerenciar'

export const Route = createFileRoute('/_app/ordens-servico/$id/gerenciar')({
  component: RouteComponent,
  loader: ({ params }) => getOrdemServico({ data: Number(params.id) }),
})

function RouteComponent() {
  const os = Route.useLoaderData()
  const { id } = Route.useParams()
  return <GerenciarOSPage os={os} id={id} />
}
