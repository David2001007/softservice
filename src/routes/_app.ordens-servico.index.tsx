import { createFileRoute } from '@tanstack/react-router'
import { getOrdensServico } from '@/features/ordens-servico/server'
import { OrdensServicoPage } from '@/features/ordens-servico'

export const Route = createFileRoute('/_app/ordens-servico/')({
  validateSearch: (search: Record<string, unknown>) => ({
    status: search.status as string | undefined,
  }),
  component: RouteComponent,
  loader: () => getOrdensServico(),
})

function RouteComponent() {
  const ordens = Route.useLoaderData()
  return <OrdensServicoPage ordens={ordens} />
}
