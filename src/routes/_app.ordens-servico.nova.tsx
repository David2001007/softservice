import { createFileRoute } from '@tanstack/react-router'
import { NovaOrdemServicoPage } from '@/features/ordens-servico/nova'
import { getClientes } from '@/features/clientes/server'
import { getTecnicos } from '@/features/tecnicos/server'
import { getConfiguracoes } from '@/features/configuracoes/server'

export const Route = createFileRoute('/_app/ordens-servico/nova')({
  loader: async () => {
    const [clientes, tecnicos, configuracoes] = await Promise.all([
      getClientes(),
      getTecnicos(),
      getConfiguracoes(),
    ])
    return { clientes, tecnicos, configuracoes }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { clientes, tecnicos, configuracoes } = Route.useLoaderData()
  return <NovaOrdemServicoPage clientes={clientes} tecnicos={tecnicos} configuracoes={configuracoes} />
}

