import { createFileRoute, redirect } from '@tanstack/react-router'
import { getConfiguracoes } from '@/features/configuracoes/server'
import { ConfiguracoesPage } from '@/features/configuracoes'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app/configuracoes/')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem('unite-auth')
    if (raw) {
      try {
        const state = JSON.parse(raw)
        const role = state?.state?.user?.role
        if (role === 'atendente') {
          setTimeout(() => {
            toast.error('Acesso restrito. Apenas administradores podem acessar as configurações.')
          }, 100)
          throw redirect({ to: '/dashboard' })
        }
      } catch (e: any) {
        if (e?.status === 301 || e?.status === 302 || e?.isRedirect) throw e
      }
    }
  },
  loader: () => getConfiguracoes(),
  component: RouteComponent,
})

function RouteComponent() {
  const configMap = Route.useLoaderData()
  return <ConfiguracoesPage configMap={configMap} />
}
