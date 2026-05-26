import { createFileRoute } from '@tanstack/react-router'
import { getAtendente } from '@/features/atendentes/server'
import { VerAtendentePage } from '@/features/atendentes/ver'

export const Route = createFileRoute('/_app/atendentes/$id/')({
  component: RouteComponent,
  loader: ({ params }) => getAtendente({ data: Number(params.id) }),
})

function RouteComponent() {
  const atendente = Route.useLoaderData()
  const { id } = Route.useParams()
  return <VerAtendentePage atendente={atendente} id={id} />
}
