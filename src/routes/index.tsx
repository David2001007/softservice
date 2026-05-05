import { createFileRoute, redirect } from '@tanstack/react-router'
import { lazy, Suspense, useMemo, useState } from 'react'
import { Zap, Shield, BarChart3, LogIn, ArrowRight, X } from 'lucide-react'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

// Lazy-load the heavy WebGL component – page content renders immediately
const FloatingLines = lazy(() => import('@/components/animations/FloatingLines'))

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('softservice-auth')
      if (!raw) return
      const state = JSON.parse(raw)
      if (state?.state?.isAuthenticated) throw redirect({ to: '/dashboard' })
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'to' in e) throw e
    }
  },
  component: LandingPage,
})

// Defined outside component – never recreated
const GRADIENT = ['#2A0A5E', '#7D12FF', '#9333FF', '#C7A6FF', '#7D12FF', '#2A0A5E']

const FEATURES = [
  { icon: Zap,       title: 'Agilidade',    sub: 'Fluxos otimizados para execução rápida.' },
  { icon: Shield,    title: 'Segurança',    sub: 'Dados protegidos com criptografia de ponta.' },
  { icon: BarChart3, title: 'Inteligência', sub: 'Relatórios dinâmicos para decisões precisas.' },
]

function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const floatingLinesProps = useMemo(
    () => ({
      linesGradient:    GRADIENT,
      enabledWaves:     ['top', 'middle', 'bottom'] as const,
      // Original example uses [10,15,20]; we use [8,12,16] – full visual effect,
      // still fine because canvas renders at 60% resolution (SCALE=0.6)
      lineCount:        [8, 12, 16],
      lineDistance:     [8, 6, 4],
      // rotate uses the original small-float scale that feeds log(length(uv)+1)
      topWavePosition:    { x: 10.0, y:  0.5, rotate: -0.4 },
      middleWavePosition: { x:  5.0, y:  0.0, rotate:  0.2 },
      bottomWavePosition: { x:  2.0, y: -0.7, rotate: -1.0 },
      bendRadius:       5.0,
      bendStrength:     -0.5,
      animationSpeed:   0.8,
      interactive:      true,
      parallax:         true,
      parallaxStrength: 0.15,
      mixBlendMode:     'screen' as const,
    }),
    [],
  )

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-background font-sans">
      {/* ── Background animation (lazy, non-blocking) ── */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <Suspense fallback={null}>
          <FloatingLines {...floatingLinesProps} />
        </Suspense>
      </div>

      {/* ── Gradient overlay ── */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-b from-background/30 via-background/55 to-background" />

      {/* ── Main content ── */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-16 text-center sm:px-8 md:px-12 lg:px-16">

        {/* Logo */}
        <div className="mb-10 flex flex-col items-center animate-float sm:mb-14">
          <div className="relative mb-5">
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/30 blur-[28px]" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-primary to-primary-hover shadow-2xl sm:h-20 sm:w-20">
              <Zap className="h-8 w-8 text-white sm:h-10 sm:w-10" />
            </div>
          </div>

          <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Pulse<span className="text-primary">Net</span>
          </h1>

          <div className="mt-2 flex items-center gap-3">
            <div className="h-px w-6 bg-gold/50 sm:w-8" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold sm:text-xs">Gestão de OS</p>
            <div className="h-px w-6 bg-gold/50 sm:w-8" />
          </div>
        </div>

        {/* Hero */}
        <div className="mb-10 max-w-3xl space-y-5 sm:mb-14 sm:space-y-8">
          <h2 className="text-[2.4rem] font-black uppercase italic leading-[0.9] tracking-tight text-white
                         sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="block text-text/60">Conectando</span>
            <span className="block text-primary">Pessoas.</span>
            <span className="block text-text/60">Impulsionando</span>
            <span className="block text-gold">Soluções.</span>
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-text-muted sm:text-base md:text-lg lg:max-w-lg">
            A plataforma definitiva para agilizar, organizar e escalar sua gestão de serviços em tempo real.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="group h-14 w-full rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-8
                           font-black uppercase tracking-widest text-white shadow-[0_10px_30px_-5px_rgba(125,18,255,0.5)]
                           transition-all hover:scale-105 active:scale-95 sm:w-auto sm:px-12 sm:h-16"
              >
                <LogIn className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                Acessar Sistema
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 bg-transparent border-none shadow-none outline-none [&>button]:hidden">
              <div className="relative">
                <LoginForm onSuccess={() => setIsLoginOpen(false)} />
                <button
                  onClick={() => setIsLoginOpen(false)}
                  className="absolute right-4 top-4 z-[60] flex h-10 w-10 items-center justify-center
                             rounded-full border border-white/10 bg-white/5 text-white/50
                             transition-all hover:bg-white/10 hover:text-white"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="lg"
            className="group h-14 w-full rounded-2xl border-white/10 bg-white/5 px-8 font-black
                       uppercase tracking-widest text-white transition-all hover:bg-white/10
                       sm:w-auto sm:px-12 sm:h-16"
          >
            Saiba Mais
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-8 sm:mt-24 sm:grid-cols-3 sm:gap-10">
          {FEATURES.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="group flex flex-col items-center space-y-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10
                              bg-white/5 text-text-muted transition-all
                              group-hover:border-primary/50 group-hover:text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">{title}</h3>
                <p className="mt-1 px-2 text-[11px] leading-relaxed text-text-muted">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-[10px] uppercase tracking-[0.4em] text-text-muted/40 sm:absolute sm:bottom-8 sm:mt-0">
          PulseNet © 2026 – Advanced Management System
        </footer>
      </main>
    </div>
  )
}
