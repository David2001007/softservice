import { createFileRoute } from '@tanstack/react-router'
import { NovoMaterialPage } from '@/features/materiais/novo'

export const Route = createFileRoute('/_app/materiais/novo')({
  component: RouteComponent,
})

function RouteComponent() {
  return <NovoMaterialPage />
}
