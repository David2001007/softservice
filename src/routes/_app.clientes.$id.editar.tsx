import { createFileRoute } from '@tanstack/react-router'
import { getCliente } from '@/features/clientes/server'
import { EditarClientePage } from '@/features/clientes/editar'

export const Route = createFileRoute('/_app/clientes/$id/editar')({
  component: RouteComponent,
  loader: ({ params }) => getCliente({ data: Number(params.id) }),
})

function RouteComponent() {
  const clienteData = Route.useLoaderData()
  const { id } = Route.useParams()
  return <EditarClientePage clienteData={clienteData} id={id} />
}
