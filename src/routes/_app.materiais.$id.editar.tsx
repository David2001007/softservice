import { createFileRoute } from '@tanstack/react-router'
import { getMaterial } from '@/features/materiais/server'
import { EditarMaterialPage } from '@/features/materiais/editar'

export const Route = createFileRoute('/_app/materiais/$id/editar')({
  component: RouteComponent,
  loader: ({ params }) => getMaterial({ data: Number(params.id) }),
})

function RouteComponent() {
  const material = Route.useLoaderData()
  const { id } = Route.useParams()
  return <EditarMaterialPage material={material} id={id} />
}
