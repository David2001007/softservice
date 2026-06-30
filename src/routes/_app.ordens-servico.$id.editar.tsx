import { createFileRoute } from '@tanstack/react-router'
import { getOrdemServico } from '@/features/ordens-servico/server'
import { getClientes } from '@/features/clientes/server'
import { getTecnicos } from '@/features/tecnicos/server'
import { getConfiguracoes } from '@/features/configuracoes/server'
import { EditarOrdemServicoPage } from '@/features/ordens-servico/editar'

export const Route = createFileRoute('/_app/ordens-servico/$id/editar')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [os, clientes, tecnicos, configuracoes] = await Promise.all([
      getOrdemServico({ data: Number(params.id) }),
      getClientes(),
      getTecnicos(),
      getConfiguracoes(),
    ])
    return { os, clientes, tecnicos, configuracoes }
  },
})

function RouteComponent() {
  const { os, clientes, tecnicos, configuracoes } = Route.useLoaderData()
  const { id } = Route.useParams()
  return (
    <EditarOrdemServicoPage
      os={os}
      id={id}
      clientes={clientes}
      tecnicos={tecnicos}
      configuracoes={configuracoes}
    />
  )
}

