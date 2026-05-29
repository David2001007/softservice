import { createFileRoute } from '@tanstack/react-router'
import { NovaOrdemServicoPage } from '@/features/ordens-servico/nova'
import { getClientes } from '@/features/clientes/server'
import { getTecnicos } from '@/features/tecnicos/server'

export const Route = createFileRoute('/_app/ordens-servico/nova')({
  loader: async () => {
    const [clientes, tecnicos] = await Promise.all([
      getClientes(),
      getTecnicos(),
    ])
    return { clientes, tecnicos }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { clientes, tecnicos } = Route.useLoaderData()
  return <NovaOrdemServicoPage clientes={clientes} tecnicos={tecnicos} />
}
