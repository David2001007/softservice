import { createFileRoute } from '@tanstack/react-router'
import { getTecnico } from '@/features/tecnicos/server'
import { EditarTecnicoPage } from '@/features/tecnicos/editar'

export const Route = createFileRoute('/_app/tecnicos/$id/editar')({
  component: RouteComponent,
  loader: ({ params }) => getTecnico({ data: Number(params.id) }),
})

function RouteComponent() {
  const tecnico = Route.useLoaderData()
  const { id } = Route.useParams()
  return <EditarTecnicoPage tecnico={tecnico} id={id} />
}
