import { createFileRoute } from '@tanstack/react-router'
import { getTecnico } from '@/features/tecnicos/server'
import { VerTecnicoPage } from '@/features/tecnicos/ver'

export const Route = createFileRoute('/_app/tecnicos/$id/')({
  component: RouteComponent,
  loader: ({ params }) => getTecnico({ data: Number(params.id) }),
})

function RouteComponent() {
  const tecnico = Route.useLoaderData()
  const { id } = Route.useParams()
  return <VerTecnicoPage tecnico={tecnico} id={id} />
}
