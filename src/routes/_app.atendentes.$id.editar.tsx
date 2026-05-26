import { createFileRoute } from '@tanstack/react-router'
import { getAtendente } from '@/features/atendentes/server'
import { EditarAtendentePage } from '@/features/atendentes/editar'

export const Route = createFileRoute('/_app/atendentes/$id/editar')({
  component: RouteComponent,
  loader: ({ params }) => getAtendente({ data: Number(params.id) }),
})

function RouteComponent() {
  const atendente = Route.useLoaderData()
  const { id } = Route.useParams()
  return <EditarAtendentePage atendente={atendente} id={id} />
}
