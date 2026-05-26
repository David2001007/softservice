import { createFileRoute } from '@tanstack/react-router'
import { NovoAtendentePage } from '@/features/atendentes/novo'

export const Route = createFileRoute('/_app/atendentes/novo')({
  component: RouteComponent,
})

function RouteComponent() {
  return <NovoAtendentePage />
}
