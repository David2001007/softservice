import { z } from 'zod'

export const tecnicoSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  tipo: z.enum(['interno', 'terceiro']).default('interno'),
  empresa: z.string().optional(),
  cnpj: z.string().optional(),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('E-mail inválido'),
  regiao: z.string().optional(),
  especialidade: z.string().optional(),
  perfil: z.enum(['tecnico', 'supervisor']).default('tecnico'),
  username: z.string().min(3, 'Usuário deve ter ao menos 3 caracteres'),
  password: z
    .string()
    .min(6, 'Senha deve ter ao menos 6 caracteres')
    .optional()
    .or(z.literal('')),
  ativo: z.boolean().default(true),
})

export type TecnicoInput = z.input<typeof tecnicoSchema>
