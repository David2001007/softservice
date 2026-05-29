import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().min(1, 'E-mail ou usuário obrigatório'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export type LoginInput = z.input<typeof loginSchema>

export const userSchema = z.object({
  codigo: z.string().min(1, 'Código obrigatório'),
  nome: z.string().min(2, 'Nome obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  email: z.string().email('E-mail inválido'),
  username: z.string().min(3, 'Usuário deve ter ao menos 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  role: z.enum(['admin', 'atendente', 'supervisor']).default('atendente'),
})

export type UserInput = z.input<typeof userSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual obrigatória'),
    newPassword: z.string().min(6, 'Nova senha deve ter ao menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    email: z.string().email('E-mail inválido'),
    code: z.string().min(6, 'O código deve ter 6 dígitos').max(6),
    newPassword: z
      .string()
      .min(6, 'A nova senha deve ter ao menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
