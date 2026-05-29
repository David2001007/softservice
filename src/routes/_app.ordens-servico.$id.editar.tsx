import { createFileRoute } from '@tanstack/react-router'
import { getOrdemServico } from '@/features/ordens-servico/server'
import { getClientes } from '@/features/clientes/server'
import { getTecnicos } from '@/features/tecnicos/server'
import { EditarOrdemServicoPage } from '@/features/ordens-servico/editar'

export const Route = createFileRoute('/_app/ordens-servico/$id/editar')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [os, clientes, tecnicos] = await Promise.all([
      getOrdemServico({ data: Number(params.id) }),
      getClientes(),
      getTecnicos(),
    ])
    return { os, clientes, tecnicos }
  },
})

function RouteComponent() {
  const { os, clientes, tecnicos } = Route.useLoaderData()
  const { id } = Route.useParams()
  return (
    <EditarOrdemServicoPage
      os={os}
      id={id}
      clientes={clientes}
      tecnicos={tecnicos}
    />
  )
}
