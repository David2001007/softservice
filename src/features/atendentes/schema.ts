import { z } from 'zod'

export const atendenteSchema = z.object({
  nome: z.string({ message: 'Nome obrigatório' }).min(2, 'Nome obrigatório'),
  cpf: z
    .string({ message: 'CPF obrigatório' })
    .min(1, 'CPF obrigatório')
    .refine(
      (v) => v.replace(/\D/g, '').length === 11,
      'CPF inválido (deve ter 11 dígitos)',
    ),
  email: z.string({ message: 'E-mail obrigatório' }).email('E-mail inválido'),
  username: z.string({ message: 'Usuário obrigatório' }).min(3, 'Usuário deve ter ao menos 3 caracteres'),
  password: z
    .string()
    .min(6, 'Senha deve ter ao menos 6 caracteres')
    .optional()
    .or(z.literal('')),
  role: z.enum(['admin', 'atendente']).default('atendente'),
  ativo: z.coerce.boolean().default(true),
})

export type AtendenteInput = z.input<typeof atendenteSchema>
