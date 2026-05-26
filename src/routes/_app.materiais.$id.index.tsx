import { createFileRoute } from '@tanstack/react-router'
import { getMaterial } from '@/features/materiais/server'
import { VerMaterialPage } from '@/features/materiais/ver'

export const Route = createFileRoute('/_app/materiais/$id/')({
  component: RouteComponent,
  loader: ({ params }) => getMaterial({ data: Number(params.id) }),
})

function RouteComponent() {
  const material = Route.useLoaderData()
  const { id } = Route.useParams()
  return <VerMaterialPage material={material} id={id} />
}
