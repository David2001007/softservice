import { createFileRoute } from '@tanstack/react-router'
import { NovoClientePage } from '@/features/clientes/novo'
import { getConfiguracoes } from '@/features/configuracoes/server'

export const Route = createFileRoute('/_app/clientes/novo')({
  loader: () => getConfiguracoes(),
  component: RouteComponent,
})

function RouteComponent() {
  const configMap = Route.useLoaderData()
  return <NovoClientePage configMap={configMap} />
}
