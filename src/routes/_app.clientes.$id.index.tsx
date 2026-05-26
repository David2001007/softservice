import { createFileRoute } from '@tanstack/react-router'
import { getCliente } from '@/features/clientes/server'
import { VerClientePage } from '@/features/clientes/ver'

export const Route = createFileRoute('/_app/clientes/$id/')({
  component: RouteComponent,
  loader: ({ params }) => getCliente({ data: Number(params.id) }),
})

function RouteComponent() {
  const cliente = Route.useLoaderData()
  const { id } = Route.useParams()
  return <VerClientePage cliente={cliente} id={id} />
}
