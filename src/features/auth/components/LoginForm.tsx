import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Zap, Loader2, Eye, EyeOff, User, Lock, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { loginSchema, type LoginInput } from '@/features/auth/schema'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from '@tanstack/react-router'

// Shadcn UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { setUser } = useAuthStore()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      if (data.email === 'admin@admin.com' && data.password === 'admin123') {
        setUser({ id: 1, nome: 'Administrador', username: 'admin', role: 'admin' })
        toast.success('Login realizado com sucesso!')
        if (onSuccess) {
          onSuccess()
        }
        await router.navigate({ to: '/dashboard' })
      } else {
        toast.error('E-mail ou senha inválidos')
      }
    } catch {
      toast.error('Erro ao realizar login')
    }
  }

  return (
    <div className="w-full max-w-[440px] mx-auto fade-in">
      <Card className="bg-[#0A0F1E]/80 backdrop-blur-xl border-white/10 rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden">
        <CardContent className="p-6 sm:p-8 xl:p-12">
          
          {/* Header / Logo */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/30 blur-[20px] rounded-full animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-xl border border-white/10">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <h1 className="text-3xl font-black text-white tracking-[0.1em] uppercase">
                Pulse<span className="text-primary">Net</span>
              </h1>
              <div className="flex items-center gap-2 justify-center">
                <Separator className="w-6 bg-gold/50" />
                <p className="text-[10px] font-bold text-gold uppercase tracking-[0.3em]">Gestão de OS</p>
                <Separator className="w-6 bg-gold/50" />
              </div>
            </div>

            <div className="mt-8 space-y-1">
              <h2 className="text-xl font-bold text-white">Bem-vindo de volta!</h2>
              <p className="text-sm text-text-muted">Faça login para acessar sua conta</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">E-mail</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                <Input
                  {...form.register('email')}
                  type="email"
                  placeholder="seu@email.com"
                  className="h-14 pl-12 rounded-2xl bg-[#13192B]/50 border-white/5 text-text placeholder:text-text-muted/50 focus:border-primary/50 focus:ring-primary/10 transition-all"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-danger ml-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">Senha</Label>
                <Button variant="link" type="button" className="h-auto p-0 text-xs font-bold text-gold hover:text-gold-hover">
                  Esqueceu a senha?
                </Button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                <Input
                  {...form.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-14 pl-12 pr-12 rounded-2xl bg-[#13192B]/50 border-white/5 text-text placeholder:text-text-muted/50 focus:border-primary/50 focus:ring-primary/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-danger ml-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-[#2D1B02] font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_-5px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_30px_-10px_rgba(245,158,11,0.5)] active:scale-[0.98]"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <div className="flex items-center gap-3">
                  <LogIn className="w-5 h-5" />
                  Entrar
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-12 text-center space-y-2">
            <p className="text-sm text-text-muted">Não tem uma conta?</p>
            <Button variant="link" type="button" className="text-primary font-bold p-0 h-auto">
              Fale com o administrador
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
