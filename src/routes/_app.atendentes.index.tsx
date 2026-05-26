import { createFileRoute } from '@tanstack/react-router'
import { getAtendentes } from '@/features/atendentes/server'
import { AtendentesPage } from '@/features/atendentes'

export const Route = createFileRoute('/_app/atendentes/')({
  component: RouteComponent,
  loader: () => getAtendentes(),
})

function RouteComponent() {
  const atendentes = Route.useLoaderData()
  return <AtendentesPage atendentes={atendentes} />
}
