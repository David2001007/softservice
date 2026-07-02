import { z } from 'zod'

function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  let add = 0
  for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i)
  let rev = 11 - (add % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(cpf.charAt(9))) return false
  add = 0
  for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i)
  rev = 11 - (add % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(cpf.charAt(10))) return false
  return true
}

function validarCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]+/g, '')
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false
  let tamanho = cnpj.length - 2
  let numeros = cnpj.substring(0, tamanho)
  const digitos = cnpj.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(0))) return false
  tamanho = tamanho + 1
  numeros = cnpj.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(1))) return false
  return true
}

export const getClienteSchema = (options: {
  obrigarCpfCnpj?: boolean
  validarCpfCnpj?: boolean
  obrigarTelefone?: boolean
} = {}) => {
  return z.object({
    nome: z.string().min(2, 'Nome obrigatório'),
    cpfCnpj: z.string().optional().refine((v) => {
      const val = v || ''
      if (options.obrigarCpfCnpj && val.trim().length === 0) return false
      return true
    }, 'CPF/CNPJ obrigatório').refine((v) => {
      const val = (v || '').replace(/\D/g, '')
      if (val.length > 0 && val.length < 11) return false
      return true
    }, 'CPF/CNPJ inválido').refine((v) => {
      if (!options.validarCpfCnpj) return true
      const val = (v || '').replace(/\D/g, '')
      if (val.length === 0) return true
      if (val.length === 11) return validarCPF(val)
      if (val.length === 14) return validarCNPJ(val)
      return false
    }, 'CPF/CNPJ inválido ou incorreto'),
    telefone: z.string().optional().refine((v) => {
      const val = v || ''
      if (options.obrigarTelefone && val.trim().length === 0) return false
      return true
    }, 'Telefone obrigatório').refine((v) => {
      const val = (v || '').replace(/\D/g, '')
      if (val.length > 0 && val.length !== 11) return false
      return true
    }, 'Telefone deve ter 11 dígitos: (XX) XXXXX-XXXX'),
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
}

// Para inferência de tipo, usamos uma versão base com campos opcionais para que o formulário os aceite vazios
export const baseClienteSchema = z.object({
  nome: z.string(),
  cpfCnpj: z.string().optional(),
  telefone: z.string().optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  referencia: z.string().optional(),
  plano: z.string().optional(),
  situacaoContrato: z.enum(['assinado', 'nao_assinado']).optional(),
  status: z.enum(['ativo', 'inativo']).optional(),
})

export type ClienteInput = z.infer<typeof baseClienteSchema>
