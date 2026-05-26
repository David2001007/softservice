import { createFileRoute } from '@tanstack/react-router'
import { getTecnicos } from '@/features/tecnicos/server'
import { TecnicosPage } from '@/features/tecnicos'

export const Route = createFileRoute('/_app/tecnicos/')({
  component: RouteComponent,
  loader: () => getTecnicos(),
})

function RouteComponent() {
  const tecnicos = Route.useLoaderData()
  return <TecnicosPage tecnicos={tecnicos} />
}
