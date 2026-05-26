import { createFileRoute } from '@tanstack/react-router'
import { getMateriais } from '@/features/materiais/server'
import { MateriaisPage } from '@/features/materiais'

export const Route = createFileRoute('/_app/materiais/')({
  component: RouteComponent,
  loader: () => getMateriais(),
})

function RouteComponent() {
  const materiais = Route.useLoaderData()
  return <MateriaisPage materiais={materiais} />
}
