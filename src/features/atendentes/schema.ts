import { z } from 'zod'

export const atendenteSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  cpf: z
    .string()
    .min(1, 'CPF obrigatório')
    .refine(
      (v) => v.replace(/\D/g, '').length === 11,
      'CPF inválido (deve ter 11 dígitos)',
    ),
  email: z.string().email('E-mail inválido'),
  username: z.string().min(3, 'Usuário deve ter ao menos 3 caracteres'),
  password: z
    .string()
    .min(6, 'Senha deve ter ao menos 6 caracteres')
    .optional()
    .or(z.literal('')),
  role: z.enum(['admin', 'atendente']).default('atendente'),
})

export type AtendenteInput = z.input<typeof atendenteSchema>
