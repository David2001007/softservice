import { addDays, format } from 'date-fns'

/**
 * Retorna a data do Domingo de Páscoa para um determinado ano
 * usando o algoritmo de Meeus/Jones/Butcher.
 */
function getEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

/**
 * Retorna um Set contendo strings no formato 'YYYY-MM-DD' com
 * todos os feriados nacionais (fixos e móveis) do ano especificado.
 */
export function getHolidaysForYear(year: number): Set<string> {
  const holidays = new Set<string>()

  const fixed = [
    '01-01', // Confraternização Universal
    '04-21', // Tiradentes
    '05-01', // Dia do Trabalho
    '09-07', // Independência do Brasil
    '10-12', // Nossa Senhora Aparecida
    '11-02', // Finados
    '11-15', // Proclamação da República
    '11-20', // Dia Nacional da Consciência Negra
    '12-25', // Natal
  ]

  fixed.forEach((dateStr) => {
    holidays.add(`${year}-${dateStr}`)
  })

  const easter = getEaster(year)
  const goodFriday = addDays(easter, -2)
  holidays.add(format(goodFriday, 'yyyy-MM-dd'))
  const carnaval = addDays(easter, -47)
  holidays.add(format(carnaval, 'yyyy-MM-dd'))
  const corpusChristi = addDays(easter, 60)
  holidays.add(format(corpusChristi, 'yyyy-MM-dd'))

  return holidays
}

/** Retorna true se a data for um feriado nacional brasileiro. */
export function isHoliday(date: Date): boolean {
  const year = date.getFullYear()
  const dateStr = format(date, 'yyyy-MM-dd')
  return getHolidaysForYear(year).has(dateStr)
}

/** Retorna true se a data for sábado (6) ou domingo (0). */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/** Parâmetros de horário de atendimento (strings "HH:MM" ou vazias). */
export interface BusinessHoursConfig {
  entrada: string
  inicioIntervalo: string
  fimIntervalo: string
  saida: string
}

/** Converte "HH:MM" em minutos desde meia-noite. */
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * Verifica se o horário de uma data está dentro do expediente configurado.
 * Retorna null se passar, ou uma string descritiva de erro.
 *
 * - Se entrada e saida estiverem vazios, não valida.
 * - Se inicioIntervalo/fimIntervalo estiverem vazios, o expediente é corrido.
 */
export function checkBusinessHours(
  date: Date,
  config: BusinessHoursConfig,
): string | null {
  const { entrada, inicioIntervalo, fimIntervalo, saida } = config
  if (!entrada || !saida) return null

  const agendadoMin = date.getHours() * 60 + date.getMinutes()
  const entradaMin = toMinutes(entrada)
  const saidaMin = toMinutes(saida)

  if (agendadoMin < entradaMin || agendadoMin >= saidaMin) {
    return `Horário fora do expediente. Atendimento de ${entrada} às ${saida}.`
  }

  if (inicioIntervalo && fimIntervalo) {
    const inicioMin = toMinutes(inicioIntervalo)
    const fimMin = toMinutes(fimIntervalo)
    if (agendadoMin >= inicioMin && agendadoMin < fimMin) {
      return `Horário no intervalo de almoço (${inicioIntervalo} às ${fimIntervalo}).`
    }
  }

  return null
}
