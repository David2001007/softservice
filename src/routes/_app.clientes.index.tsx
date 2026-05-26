import { createFileRoute } from '@tanstack/react-router'
import { getClientes } from '@/features/clientes/server'
import { ClientesPage } from '@/features/clientes'

export const Route = createFileRoute('/_app/clientes/')({
  component: RouteComponent,
  loader: () => getClientes(),
})

function RouteComponent() {
  const clientes = Route.useLoaderData()
  return <ClientesPage clientes={clientes} />
}
