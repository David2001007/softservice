import { createFileRoute } from '@tanstack/react-router'
import { NovaOrdemServicoPage } from '@/features/ordens-servico/nova'

export const Route = createFileRoute('/_app/ordens-servico/nova')({
  component: RouteComponent,
})

function RouteComponent() {
  return <NovaOrdemServicoPage />
}
