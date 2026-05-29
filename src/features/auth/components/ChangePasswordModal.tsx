import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Lock, Loader2, Save } from 'lucide-react'
import {
  changePasswordSchema
  
} from '@/features/auth/schema'
import type {ChangePasswordInput} from '@/features/auth/schema';
import { changePassword } from '@/features/auth/server'
import { useAuthStore } from '@/stores/auth.store'
import { DefaultModal } from '@/components/default-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ChangePasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordModal({
  open,
  onOpenChange,
}: ChangePasswordModalProps) {
  const { user } = useAuthStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: ChangePasswordInput) => {
    if (!user) return

    try {
      await changePassword({
        data: {
          userId: user.id,
          userType: user.type,
          data,
        },
      })
      toast.success('Senha alterada com sucesso!')
      reset()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha')
    }
  }

  return (
    <DefaultModal
      open={open}
      onOpenChange={onOpenChange}
      title="Alterar Senha"
      description="Preencha os campos abaixo para atualizar sua senha de acesso."
      size="sm"
      className="bg-surface/90 backdrop-blur-xl border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">
            Senha Atual
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
            <Input
              {...register('currentPassword')}
              type="password"
              placeholder="••••••••"
              className="h-12 pl-12 rounded-2xl bg-background/50 border-white/5 text-text placeholder:text-text-muted/50 focus:border-primary/50 focus:ring-primary/10 transition-all"
            />
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-danger ml-1">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">
            Nova Senha
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
            <Input
              {...register('newPassword')}
              type="password"
              placeholder="••••••••"
              className="h-12 pl-12 rounded-2xl bg-background/50 border-white/5 text-text placeholder:text-text-muted/50 focus:border-primary/50 focus:ring-primary/10 transition-all"
            />
          </div>
          {errors.newPassword && (
            <p className="text-xs text-danger ml-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">
            Confirmar Nova Senha
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors z-10" />
            <Input
              {...register('confirmPassword')}
              type="password"
              placeholder="••••••••"
              className="h-12 pl-12 rounded-2xl bg-background/50 border-white/5 text-text placeholder:text-text-muted/50 focus:border-primary/50 focus:ring-primary/10 transition-all"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-danger ml-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-2xl h-12 px-6 font-bold text-text-muted hover:text-text"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 rounded-2xl bg-gradient-to-r from-primary to-primary-hover text-white font-bold uppercase tracking-wider px-8 shadow-[0_10px_20px_-5px_rgba(125,18,255,0.3)] hover:shadow-[0_15px_30px_-10px_rgba(125,18,255,0.5)] active:scale-[0.98] transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Atualizar Senha
          </Button>
        </div>
      </form>
    </DefaultModal>
  )
}
