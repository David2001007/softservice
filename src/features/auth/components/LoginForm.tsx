import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Zap, Loader2, Eye, EyeOff, User, Lock, LogIn, Mail, Key, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  type LoginInput, 
  type ForgotPasswordInput, 
  type ResetPasswordInput 
} from '@/features/auth/schema'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from '@tanstack/react-router'
import { login, sendResetCode, verifyResetCodeAndSetPassword } from '@/features/auth/server'

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
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login')
  const [resetEmail, setResetEmail] = useState('')

  // ── FORMS ──
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  })

  const forgotForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '', code: '', newPassword: '', confirmPassword: '' },
  })

  // ── HANDLERS ──
  const onLoginSubmit = async (data: LoginInput) => {
    try {
      const response = await login({ data })
      setUser({ 
        id: response.id, 
        nome: response.nome, 
        username: response.username, 
        role: response.role as any,
        type: response.type
      })
      toast.success('Login realizado com sucesso!')
      if (onSuccess) onSuccess()
      await router.navigate({ to: '/dashboard' })
    } catch (error: any) {
      toast.error(error.message || 'E-mail/Usuário ou senha inválidos')
    }
  }

  const onForgotSubmit = async (data: ForgotPasswordInput) => {
    try {
      await sendResetCode({ data })
      setResetEmail(data.email)
      resetForm.setValue('email', data.email)
      toast.success('Código enviado para o seu e-mail!')
      setMode('reset')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar código')
    }
  }

  const onResetSubmit = async (data: ResetPasswordInput) => {
    try {
      await verifyResetCodeAndSetPassword({ data })
      toast.success('Senha redefinida com sucesso!')
      setMode('login')
      loginForm.setValue('identifier', data.email)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao redefinir senha')
    }
  }

  return (
    <div className="w-full max-w-[440px] mx-auto fade-in">
      <Card className="bg-surface/80 backdrop-blur-xl border-white/10 rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden">
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
              <h2 className="text-xl font-bold text-white">
                {mode === 'login' && 'Bem-vindo de volta!'}
                {mode === 'forgot' && 'Recuperar Senha'}
                {mode === 'reset' && 'Nova Senha'}
              </h2>
              <p className="text-sm text-text-muted">
                {mode === 'login' && 'Faça login para acessar sua conta'}
                {mode === 'forgot' && 'Enviaremos um código para o seu e-mail'}
                {mode === 'reset' && `Digite o código enviado para ${resetEmail}`}
              </p>
            </div>
          </div>

          {/* ── LOGIN MODE ── */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">E-mail ou Usuário</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                  <Input
                    {...loginForm.register('identifier')}
                    type="text"
                    placeholder="seu@email.com ou usuário"
                    className="h-14 pl-12 rounded-2xl bg-background/50 border-white/5 text-text placeholder:text-text-muted/50 focus:border-primary/50 focus:ring-primary/10 transition-all"
                  />
                </div>
                {loginForm.formState.errors.identifier && (
                  <p className="text-xs text-danger ml-1">{loginForm.formState.errors.identifier.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">Senha</Label>
                  <Button 
                    variant="link" 
                    type="button" 
                    onClick={() => setMode('forgot')}
                    className="h-auto p-0 text-xs font-bold text-gold hover:text-gold-hover"
                  >
                    Esqueceu a senha?
                  </Button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                  <Input
                    {...loginForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-14 pl-12 pr-12 rounded-2xl bg-background/50 border-white/5 text-text placeholder:text-text-muted/50 focus:border-primary/50 focus:ring-primary/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-danger ml-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-primary-hover text-white font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_-5px_rgba(125,18,255,0.3)] hover:shadow-[0_15px_30px_-10px_rgba(125,18,255,0.5)] active:scale-[0.98]"
              >
                {loginForm.formState.isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="flex items-center gap-3">
                    <LogIn className="w-5 h-5" />
                    Entrar
                  </div>
                )}
              </Button>
            </form>
          )}

          {/* ── FORGOT MODE ── */}
          {mode === 'forgot' && (
            <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Seu E-mail</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                  <Input
                    {...forgotForm.register('email')}
                    type="email"
                    placeholder="seu@email.com"
                    className="h-14 pl-12 rounded-2xl bg-background/50 border-white/5 text-text placeholder:text-text-muted/50 focus:border-primary/50 focus:ring-primary/10 transition-all"
                  />
                </div>
                {forgotForm.formState.errors.email && (
                  <p className="text-xs text-danger ml-1">{forgotForm.formState.errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={forgotForm.formState.isSubmitting}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-primary-hover text-white font-black uppercase tracking-widest transition-all shadow-xl"
              >
                {forgotForm.formState.isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  'Enviar Código'
                )}
              </Button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-text-muted hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar ao Login
              </button>
            </form>
          )}

          {/* ── RESET MODE ── */}
          {mode === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Código de 6 dígitos</Label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                  <Input
                    {...resetForm.register('code')}
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="h-14 pl-12 rounded-2xl bg-background/50 border-white/5 text-text placeholder:text-text-muted/50 focus:border-primary/50 focus:ring-primary/10 transition-all tracking-[0.5em] font-bold"
                  />
                </div>
                {resetForm.formState.errors.code && (
                  <p className="text-xs text-danger ml-1">{resetForm.formState.errors.code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Nova Senha</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                  <Input
                    {...resetForm.register('newPassword')}
                    type="password"
                    placeholder="••••••••"
                    className="h-14 pl-12 rounded-2xl bg-background/50 border-white/5 text-text placeholder:text-text-muted/50 focus:border-primary/50 focus:ring-primary/10 transition-all"
                  />
                </div>
                {resetForm.formState.errors.newPassword && (
                  <p className="text-xs text-danger ml-1">{resetForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Confirmar Senha</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
                  <Input
                    {...resetForm.register('confirmPassword')}
                    type="password"
                    placeholder="••••••••"
                    className="h-14 pl-12 rounded-2xl bg-background/50 border-white/5 text-text placeholder:text-text-muted/50 focus:border-primary/50 focus:ring-primary/10 transition-all"
                  />
                </div>
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-danger ml-1">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={resetForm.formState.isSubmitting}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-primary-hover text-white font-black uppercase tracking-widest transition-all shadow-xl"
              >
                {resetForm.formState.isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />
                    Alterar Senha
                  </div>
                )}
              </Button>

              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-text-muted hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Reenviar Código
              </button>
            </form>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
