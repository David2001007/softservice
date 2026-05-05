import { z } from 'zod'

export const materialSchema = z.object({
  codigo: z.string().min(1, 'Código obrigatório'),
  descricao: z.string().min(2, 'Descrição obrigatória'),
  categoria: z.string().min(1, 'Categoria obrigatória'),
  unidade: z.string().min(1, 'Unidade obrigatória'),
  quantidade: z.string().default('0'),
  estoqueMinimo: z.string().default('0'),
  comodato: z.boolean().default(false),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
})

export type MaterialInput = z.input<typeof materialSchema>
