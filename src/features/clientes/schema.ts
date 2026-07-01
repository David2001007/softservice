import { z } from 'zod'

export const clienteSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  cpfCnpj: z
    .string()
    .min(1, 'CPF/CNPJ obrigatório')
    .refine(
      (v) => v.replace(/\D/g, '').length >= 11,
      'CPF/CNPJ inválido',
    ),
  telefone: z
    .string()
    .min(1, 'Telefone obrigatório')
    .refine(
      (v) => v.replace(/\D/g, '').length === 11,
      'Telefone deve ter 11 dígitos: (XX) XXXXX-XXXX',
    ),
  cep: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.replace(/\D/g, '').length === 8,
      'CEP inválido (deve ter 8 dígitos)',
    ),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().max(2).optional(),
  referencia: z.string().optional(),
  plano: z.string().optional(),
  situacaoContrato: z
    .enum(['assinado', 'nao_assinado'])
    .default('nao_assinado'),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
})

export type ClienteInput = z.input<typeof clienteSchema>
