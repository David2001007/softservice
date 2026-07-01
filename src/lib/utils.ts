import { clsx  } from 'clsx'
import type {ClassValue} from 'clsx';
import { twMerge } from 'tailwind-merge'
import { format as dfFormat } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  date: Date | string | null | undefined,
  opts?: { time?: boolean },
): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  if (opts?.time) {
    // Formato brasileiro DD/MM/AAAA HH:mm em 24h com espaço separador
    return dfFormat(d, 'dd/MM/yyyy HH:mm', { locale: ptBR })
  }
  return dfFormat(d, 'dd/MM/yyyy', { locale: ptBR })
}


export function formatCPFCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatNumber(
  value: number | string | null | undefined,
  opts?: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  },
): string {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return '0'

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: opts?.minimumFractionDigits ?? 0,
    maximumFractionDigits: opts?.maximumFractionDigits ?? 3,
  }).format(parsed)
}

export function getEstoqueUnidadeLabel(
  material: { unidade?: string | null } | null | undefined,
): string {
  if (!material) return 'unidades'

  const unidade = material.unidade?.trim()
  const normalized = unidade?.toLowerCase()

  if (normalized === 'metro' || normalized === 'metros') {
    return 'metros'
  }

  if (normalized === 'unidade' || normalized === 'unidades') {
    return 'unidades'
  }

  if (normalized === 'rolo' || normalized === 'rolos') {
    return 'rolos'
  }

  if (normalized === 'caixa' || normalized === 'caixas') {
    return 'caixas'
  }

  if (normalized === 'par' || normalized === 'pares') {
    return 'pares'
  }

  if (normalized === 'kit' || normalized === 'kits') {
    return 'kits'
  }

  if (normalized === 'metro_linear' || normalized === 'm' || normalized === 'm²' || normalized === 'm3') {
    return 'metros'
  }

  if (normalized) {
    return unidade || 'unidades'
  }

  return 'unidades'
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

/** Aplica máscara de telefone enquanto o usuário digita: (XX) XXXXX-XXXX */
export function applyPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.replace(/(\d{0,2})/, '($1')
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d{1,4})/, '($1) $2')
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

/** Aplica máscara de CEP enquanto o usuário digita: XXXXX-XXX */
export function applyCepMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return digits.replace(/(\d{5})(\d{1,3})/, '$1-$2')
}

/** Aplica máscara de CPF (000.000.000-00) ou CNPJ (00.000.000/0001-00) enquanto o usuário digita */
export function applyCpfCnpjMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return digits.replace(/(\d{3})(\d{1,3})/, '$1.$2')
  if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
  if (digits.length <= 11) return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
  if (digits.length <= 12) return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3/$4')
  if (digits.length <= 13) return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1})/, '$1.$2.$3/$4-$5')
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/** Remove todos os caracteres não numéricos de uma string mascarada */
export function stripMask(value: string): string {
  return value.replace(/\D/g, '')
}

export function gerarCodigo(prefix: string): string {
  const now = Date.now().toString(36).toUpperCase()
  return `${prefix}-${now}`
}
