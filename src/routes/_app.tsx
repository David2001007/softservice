import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppLayout } from '@/components/layout/app-layout'

export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return

    const raw = localStorage.getItem('softservice-auth')
    if (raw) {
      try {
        const state = JSON.parse(raw)
        if (state?.state?.isAuthenticated) return
      } catch { /* ignore */ }
    }
    throw redirect({ to: '/' })
  },
  component: AppLayout,
})
