import { createFileRoute, redirect } from '@tanstack/react-router'
import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  LogIn,
  Maximize2,
  PlayCircle,
  X,
  Users,
} from 'lucide-react'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// Lazy-load the heavy WebGL component - page content renders immediately
const FloatingLines = lazy(
  () => import('@/components/animations/FloatingLines'),
)

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('unite-auth')
      if (!raw) return
      const state = JSON.parse(raw)
      if (state?.state?.isAuthenticated) throw redirect({ to: '/dashboard' })
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'to' in e) throw e
    }
  },
  component: LandingPage,
})

// Defined outside component - never recreated
const GRADIENT = [
  '#2A0A5E',
  '#7D12FF',
  '#9333FF',
  '#C7A6FF',
  '#7D12FF',
  '#2A0A5E',
]

type TeamMember = {
  name: string
  role: string
  photo: string
  photoClass?: string
}

const TEAM: TeamMember[] = [
  {
    name: 'David Lucas Machado',
    role: 'DevOps/Desenvolvedor',
    photo: '/assets/pessoas/david.png',
    photoClass: 'scale-90',
  },
  {
    name: 'Fabricio Milioransa Dalanhol',
    role: 'Analista/Desenvolvedor',
    photo: '/assets/pessoas/fabricio.png',
  },
  {
    name: 'Felipe de Lima Rodrigues',
    role: 'QA/Desenvolvedor',
    photo: '/assets/pessoas/felipe.jpeg',
  },
]

const TECHNOLOGIES = [
  { name: 'React', logo: '/assets/tecnologias/react.png' },
  { name: 'TypeScript', logo: '/assets/tecnologias/typesctript.webp' },
  { name: 'Tailwind CSS', logo: '/assets/tecnologias/tailwind.png' },
  { name: 'Node.js', logo: '/assets/tecnologias/node.png' },
  { name: 'Supabase', logo: '/assets/tecnologias/supabase.png' },
  { name: 'TanStack', logo: '/assets/tecnologias/tanstack.png' },
]

const DEMO_EMBED_SRC = 'https://www.youtube.com/embed/bclfnNrCfoI'

function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const demoEmbedRef = useRef<HTMLIFrameElement>(null)

  const floatingLinesProps = useMemo(
    () => ({
      linesGradient: GRADIENT,
      enabledWaves: ['top', 'middle', 'bottom'] as const,
      lineCount: [8, 12, 16],
      lineDistance: [8, 6, 4],
      topWavePosition: { x: 10.0, y: 0.5, rotate: -0.4 },
      middleWavePosition: { x: 5.0, y: 0.0, rotate: 0.2 },
      bottomWavePosition: { x: 2.0, y: -0.7, rotate: -1.0 },
      bendRadius: 5.0,
      bendStrength: -0.5,
      animationSpeed: 0.8,
      interactive: true,
      parallax: true,
      parallaxStrength: 0.15,
      mixBlendMode: 'screen' as const,
    }),
    [],
  )

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const openDemoFullscreen = () => {
    const player = demoEmbedRef.current
    if (!player?.requestFullscreen) return

    void player.requestFullscreen().catch(() => undefined)
  }

  return (
    <div className="relative min-h-screen w-screen bg-background font-sans">
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <Suspense fallback={null}>
          <FloatingLines {...floatingLinesProps} />
        </Suspense>
      </div>

      {/* Gradient overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-b from-background/30 via-background/55 to-background" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-8 sm:px-12">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-[15px] rounded-xl group-hover:bg-primary/40 transition-all" />
            <div className="relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden shadow-2xl">
              <img
                src="/logo.webp"
                alt="Unite Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <span className="text-2xl font-black tracking-tighter text-secondary uppercase">
            Unite
          </span>
        </div>
      </nav>

      {/* Main content with snap scrolling */}
      <main className="relative z-10 flex flex-col items-center text-center h-screen overflow-y-scroll snap-y snap-mandatory">
        {/* Hero */}
        <section
          id="hero"
          className="flex min-h-screen w-full flex-col items-center justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-16 snap-start"
        >
          <div className="mb-10 max-w-3xl space-y-5 sm:mb-14 sm:space-y-8">
            <h2
              className="text-[2.4rem] font-black uppercase italic leading-[0.9] tracking-tight text-white
                           sm:text-6xl md:text-7xl lg:text-8xl"
            >
              <span className="block text-text/60">Conectando</span>
              <span className="block text-primary">equipes.</span>
              <span className="block text-text/60">Impulsionando</span>
              <span className="block text-gold">resultados.</span>
            </h2>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-text-muted sm:text-base md:text-lg lg:max-w-lg">
              A plataforma definitiva para agilizar, organizar e escalar sua
              gestão de serviços em tempo real.
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
                    className="absolute right-6 top-6 z-[60] flex h-10 w-10 items-center justify-center
                               rounded-2xl border border-white/10 bg-surface/50 text-white/40 backdrop-blur-md
                               transition-all hover:bg-primary/20 hover:text-white hover:border-primary/30
                               shadow-xl group/close"
                    aria-label="Fechar"
                  >
                    <X className="h-5 w-5 transition-transform group-hover/close:rotate-90" />
                  </button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="lg"
              onClick={() => scrollToSection('equipe')}
              className="hidden sm:flex group h-14 w-full rounded-2xl border-white/10 bg-white/5 px-8 font-black
                         uppercase tracking-widest text-white transition-all hover:bg-white/10
                         sm:w-auto sm:px-12 sm:h-16"
            >
              Saiba Mais
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </section>

        {/* Nossa Equipe */}
        <section
          id="equipe"
          className="hidden sm:flex min-h-screen w-full flex-col items-center justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-16 sm:py-20 md:py-24 snap-start"
        >
          <div className="w-full max-w-5xl">
            <div className="mb-10 sm:mb-12 md:mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                  Nossa Equipe
                </h2>
              </div>
              <p className="text-text-muted max-w-2xl mx-auto">
                Os especialistas que transformam ideias em soluções concretas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
              {TEAM.map((member, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a0b2e] to-[#11061f] shadow-2xl transition-all hover:border-primary/40 hover:shadow-primary/20 hover:-translate-y-2 flex flex-col items-center pt-0"
                >
                  <div className="w-full h-20 bg-[#2A0A5E]/40 flex items-center justify-center border-b border-white/5 relative">
                    {/* Lanyard hole */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 border-4 border-[#11061f] rounded-full bg-background shadow-inner" />
                    <img
                      src="/logo.webp"
                      alt="Unite Logo"
                      className="h-8 opacity-80 mt-2"
                    />
                  </div>
                  <div className="p-8 w-full flex flex-col items-center text-center relative">
                    <div className="mb-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white/10 bg-gradient-to-br from-primary/20 to-transparent text-4xl font-black text-white shadow-lg ring-2 ring-primary/20">
                      <img
                        src={member.photo}
                        alt={`Foto de ${member.name}`}
                        className={`h-full w-full object-cover ${member.photoClass ?? ''}`}
                        loading="lazy"
                      />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-wider text-white">
                      {member.name}
                    </h3>
                    <div className="mt-4 bg-primary/20 px-4 py-1.5 rounded-full border border-primary/30">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">
                        {member.role}
                      </p>
                    </div>
                    <div className="mt-8 w-full pt-4 border-t border-white/10 flex justify-between items-center px-2">
                      <div className="text-[10px] font-mono text-white/30">
                        ID: 00{index + 1}
                      </div>
                      <div className="h-4 w-12 bg-white/20 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sobre a Unite */}
        <section
          id="sobre"
          className="hidden sm:flex min-h-screen w-full flex-col items-center justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-16 sm:py-20 md:py-24 snap-start"
        >
          <div className="w-full max-w-5xl">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a0b2e] to-[#11061f] p-8 sm:p-10 md:p-12 lg:p-16 shadow-2xl">
              <h2 className="mb-6 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                O que é a <span className="text-primary">Unite</span>?
              </h2>
              <div className="space-y-6 text-left text-text-muted">
                <p className="text-lg leading-relaxed">
                  A <span className="text-white font-semibold">Unite</span> é um
                  sistema de gestão de serviços completo, desenvolvido para
                  otimizar processos, centralizar informações e conectar equipes
                  de atendimento, técnicos e clientes em uma única plataforma
                  intuitiva e moderna.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                    <div>
                      <h4 className="font-semibold text-white">
                        O que atende?
                      </h4>
                      <p className="text-sm">
                        Gestão de ordens de serviço, clientes, técnicos,
                        materiais e relatórios.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                    <div>
                      <h4 className="font-semibold text-white">Beneficios</h4>
                      <p className="text-sm">
                        Interface moderna, segurança de dados e integração
                        total.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tecnologias */}
        <section
          id="tecnologias"
          className="hidden sm:flex min-h-screen w-full flex-col items-center justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-16 sm:py-20 md:py-24 snap-start"
        >
          <div className="w-full max-w-5xl">
            <h2 className="mb-12 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl text-center">
              Tecnologias Utilizadas
            </h2>

            <div className="flex flex-wrap justify-center gap-4">
              {TECHNOLOGIES.map((tech, index) => (
                <div
                  key={index}
                  className="group flex min-h-[150px] min-w-[150px] flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a0b2e] to-[#11061f] p-6 shadow-lg transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_10px_30px_-10px_rgba(125,18,255,0.3)]"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/95 p-3 shadow-[0_12px_30px_-18px_rgba(255,255,255,0.8)] transition-all group-hover:scale-105 group-hover:bg-white">
                    <img
                      src={tech.logo}
                      alt={`Logo ${tech.name}`}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span className="font-semibold text-white text-sm tracking-wide">
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section
          id="cta"
          className="hidden sm:flex min-h-screen w-full flex-col items-center justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-16 sm:py-20 md:py-24 snap-start"
        >
          <div className="w-full max-w-3xl">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a0b2e] to-[#11061f] p-8 sm:p-10 md:p-12 lg:p-16 shadow-2xl">
              <h2 className="mb-4 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                Vamos conhecer nosso sistema?
              </h2>
              <p className="mb-8 text-text-muted">
                Assista a uma demonstração rápida e veja a Unite em ação.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Dialog open={isDemoOpen} onOpenChange={setIsDemoOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="group h-14 w-full rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-8
                                 font-black uppercase tracking-widest text-white shadow-[0_10px_30px_-5px_rgba(125,18,255,0.5)]
                                 transition-all hover:scale-105 active:scale-95 sm:w-auto sm:px-12 sm:h-16"
                    >
                      <PlayCircle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                      Ver demonstração
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[95dvh] w-[95vw] max-w-[95vw] overflow-hidden border-white/10 bg-[#11061f] p-0 shadow-2xl sm:max-w-[95vw] lg:w-[92vw] lg:max-w-7xl [&>button]:hidden">
                    <DialogTitle className="sr-only">
                      Demonstração Unite
                    </DialogTitle>
                    <div className="relative flex max-h-[95dvh] flex-col">
                      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-left sm:px-5">
                        <div className="min-w-0">
                          <h3 className="text-base font-black uppercase tracking-wider text-white sm:text-lg">
                            Demonstração Unite
                          </h3>
                          <p className="mt-1 truncate text-xs text-text-muted sm:text-sm">
                            Veja os principais fluxos do sistema.
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={openDemoFullscreen}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition-all hover:border-primary/30 hover:bg-primary/20 hover:text-white"
                            aria-label="Abrir vídeo em tela cheia"
                          >
                            <Maximize2 className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDemoOpen(false)}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/50 transition-all hover:border-primary/30 hover:bg-primary/20 hover:text-white"
                            aria-label="Fechar demonstração"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex min-h-0 flex-1 items-center justify-center bg-black">
                        <iframe
                          ref={demoEmbedRef}
                          src={DEMO_EMBED_SRC}
                          title="Demonstracao Unite"
                          className="aspect-video max-h-[calc(95dvh-72px)] w-full bg-black"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => scrollToSection('hero')}
                  className="group h-14 w-full rounded-2xl border-white/10 bg-white/5 px-8 font-black
                             uppercase tracking-widest text-white transition-all hover:bg-white/10
                             sm:w-auto sm:px-12 sm:h-16"
                >
                  <ArrowUp className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                  Voltar ao topo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="hidden sm:block py-8 text-[10px] uppercase tracking-[0.4em] text-text-muted/40">
          Unite © 2026 - Advanced Management System
        </footer>
      </main>
    </div>
  )
}
