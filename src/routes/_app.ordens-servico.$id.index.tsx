import { createFileRoute } from '@tanstack/react-router'
import { getOrdemServico } from '@/features/ordens-servico/server'
import { VerOrdemServicoPage } from '@/features/ordens-servico/ver'

export const Route = createFileRoute('/_app/ordens-servico/$id/')({
  component: RouteComponent,
  loader: ({ params }) => getOrdemServico({ data: Number(params.id) }),
})

function RouteComponent() {
  const os = Route.useLoaderData()
  const { id } = Route.useParams()
  return <VerOrdemServicoPage os={os} id={id} />
}
