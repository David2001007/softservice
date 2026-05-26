import { createFileRoute } from '@tanstack/react-router'
import { getOrdensServico } from '@/features/ordens-servico/server'
import { OrdensServicoPage } from '@/features/ordens-servico'

export const Route = createFileRoute('/_app/ordens-servico/')({
  component: RouteComponent,
  loader: () => getOrdensServico(),
})

function RouteComponent() {
  const ordens = Route.useLoaderData()
  return <OrdensServicoPage ordens={ordens} />
}
