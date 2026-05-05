import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Zap, Shield, BarChart3, LogIn, ArrowRight, X } from 'lucide-react'
import Hyperspeed from '@/components/animations/Hyperspeed'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return

    const raw = localStorage.getItem('softservice-auth')
    if (raw) {
      try {
        const state = JSON.parse(raw)
        if (state?.state?.isAuthenticated) {
          throw redirect({ to: '/dashboard' })
        }
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'to' in e) throw e
      }
    }
  },
  component: LandingPage,
})

function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const hyperspeedOptions = useMemo(() => ({
    distortion: 'turbulentDistortion' as const,
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 3,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 12,
    lightPairsPerRoadWay: 30,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5],
    lightStickHeight: [1.3, 1.7],
    movingAwaySpeed: [60, 80],
    movingCloserSpeed: [-120, -160],
    carLightsLength: [12, 80],
    carLightsRadius: [0.05, 0.14],
    carWidthPercentage: [0.3, 0.5],
    carShiftX: [-0.8, 0.8],
    carFloorSeparation: [0, 5],
    colors: {
      roadColor: 0x020617,
      islandColor: 0x0F172A,
      background: 0x020617,
      shoulderLines: 0xFFFFFF,
      brokenLines: 0xFFFFFF,
      leftCars: [0x1D4ED8, 0x2563EB, 0x3B82F6],
      rightCars: [0xD4AF37, 0xEAB308, 0xFDE68A],
      sticks: 0x1D4ED8,
    }
  }), [])

  return (
    <div className="min-h-screen w-screen bg-[#020617] relative overflow-x-hidden font-sans flex flex-col items-center justify-center">
      {/* Background Effect */}
      <div className="fixed inset-0 z-0">
        <Hyperspeed effectOptions={hyperspeedOptions} />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 text-center">
        <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-[#020617]/20 via-[#020617]/60 to-[#020617] pointer-events-none" />
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8 sm:mb-12 animate-float">
          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-primary/30 blur-[24px] rounded-full animate-pulse" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-2xl border border-white/10">
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-[0.2em] uppercase">
            Pulse<span className="text-primary">Net</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="h-[1px] w-6 sm:w-8 bg-gold/50" />
            <p className="text-[10px] sm:text-xs font-bold text-gold uppercase tracking-[0.4em]">Gestão de OS</p>
            <div className="h-[1px] w-6 sm:w-8 bg-gold/50" />
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-4xl space-y-6 sm:space-y-10 mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-white uppercase italic">
            <span className="text-text/60 block">Conectando</span>
            <span className="text-primary block">Pessoas.</span>
            <span className="text-text/60 block">Impulsionando</span>
            <span className="text-gold block">Soluções.</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-text-muted max-w-lg mx-auto leading-relaxed">
            A plataforma definitiva para agilizar, organizar e escalar sua gestão de serviços em tempo real.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="h-16 px-8 sm:px-12 rounded-2xl bg-gradient-to-r from-primary to-primary-hover text-white font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_-5px_rgba(29,78,216,0.5)] hover:scale-105 active:scale-95 group"
              >
                <div className="flex items-center gap-3">
                  <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Acessar Sistema
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 bg-transparent border-none shadow-none outline-none [&>button]:hidden">
              <div className="relative">
                <LoginForm onSuccess={() => setIsLoginOpen(false)} />
                <button 
                  onClick={() => setIsLoginOpen(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all z-[60] border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            size="lg" 
            className="h-16 px-8 sm:px-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest transition-all group"
          >
            <div className="flex items-center gap-3">
              Saiba Mais
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Button>
        </div>

        {/* Features Minimal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mt-24 max-w-4xl w-full">
          {[
            { icon: Zap, title: "Agilidade", sub: "Fluxos otimizados para execução rápida." },
            { icon: Shield, title: "Segurança", sub: "Dados protegidos com criptografia de ponta." },
            { icon: BarChart3, title: "Inteligência", sub: "Relatórios dinâmicos para decisões precisas." },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted group-hover:text-primary transition-all group-hover:border-primary/50">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">{item.title}</h3>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed px-4">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="absolute bottom-8 text-[10px] text-text-muted uppercase tracking-[0.4em] opacity-50">
          PulseNet © 2026 – Advanced Management System
        </div>
      </div>
    </div>
  )
}
