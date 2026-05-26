import { createFileRoute } from '@tanstack/react-router'
import { NovoTecnicoPage } from '@/features/tecnicos/novo'

export const Route = createFileRoute('/_app/tecnicos/novo')({
  component: RouteComponent,
})

function RouteComponent() {
  return <NovoTecnicoPage />
}
