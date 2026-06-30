import { describe, it, expect } from 'vitest'
import { isHoliday } from './holidays'

describe('Utilitário de Feriados (isHoliday)', () => {
  it('deve identificar feriados nacionais fixos', () => {
    // Ano Novo (1 de Janeiro)
    expect(isHoliday(new Date(2026, 0, 1))).toBe(true)

    // Tiradentes (21 de Abril)
    expect(isHoliday(new Date(2026, 3, 21))).toBe(true)

    // Dia do Trabalho (1 de Maio)
    expect(isHoliday(new Date(2026, 4, 1))).toBe(true)

    // Dia da Consciência Negra (20 de Novembro)
    expect(isHoliday(new Date(2026, 10, 20))).toBe(true)

    // Natal (25 de Dezembro)
    expect(isHoliday(new Date(2026, 11, 25))).toBe(true)
  })

  it('deve identificar feriados nacionais móveis em 2026', () => {
    // Em 2026, a Páscoa cai em 5 de Abril.
    
    // Carnaval (Terça-feira) é Páscoa - 47 dias = 17 de Fevereiro de 2026
    expect(isHoliday(new Date(2026, 1, 17))).toBe(true)

    // Sexta-feira Santa é Páscoa - 2 dias = 3 de Abril de 2026
    expect(isHoliday(new Date(2026, 3, 3))).toBe(true)

    // Corpus Christi é Páscoa + 60 dias = 4 de Junho de 2026
    expect(isHoliday(new Date(2026, 5, 4))).toBe(true)
  })

  it('deve retornar false para dias úteis normais', () => {
    // 24 de Dezembro (Véspera de Natal)
    expect(isHoliday(new Date(2026, 11, 24))).toBe(false)

    // Um dia comum (ex: 15 de Julho de 2026)
    expect(isHoliday(new Date(2026, 6, 15))).toBe(false)
  })
})
