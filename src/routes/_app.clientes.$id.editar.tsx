import { createFileRoute } from '@tanstack/react-router'
import { getCliente } from '@/features/clientes/server'
import { EditarClientePage } from '@/features/clientes/editar'
import { getConfiguracoes } from '@/features/configuracoes/server'

export const Route = createFileRoute('/_app/clientes/$id/editar')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [clienteData, configMap] = await Promise.all([
      getCliente({ data: Number(params.id) }),
      getConfiguracoes(),
    ])
    return { clienteData, configMap }
  },
})

function RouteComponent() {
  const { clienteData, configMap } = Route.useLoaderData()
  const { id } = Route.useParams()
  return <EditarClientePage clienteData={clienteData} id={id} configMap={configMap} />
}
