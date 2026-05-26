import { createFileRoute } from '@tanstack/react-router'
import { NovoClientePage } from '@/features/clientes/novo'

export const Route = createFileRoute('/_app/clientes/novo')({
  component: RouteComponent,
})

function RouteComponent() {
  return <NovoClientePage />
}
