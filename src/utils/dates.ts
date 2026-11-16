// ========================================
// Datas de negócio no fuso da casa (America/Sao_Paulo)
// ========================================
//
// Contrato com o backend (functions/src/shared/dates.ts):
//  - Data pura "YYYY-MM-DD" é um dia civil em Brasília (gravado como 00:00 BRT).
//  - Vencimento é o fim do dia civil em BRT (23:59:59.999 BRT).
//  - Evento "YYYY-MM-DDTHH:MM" sem fuso = horário de Brasília.
//  - Legado: datas puras antigas foram gravadas como 00:00:00.000Z; esse instante
//    exato é tratado como a própria data UTC (mesma regra do `civilDateOf` do back).
//
// Toda formatação aqui passa o timeZone explicitamente: o resultado não depende
// do fuso do navegador.

export const APP_TIME_ZONE = 'America/Sao_Paulo'

const CIVIL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const DATETIME_LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const pad2 = (n: number) => String(n).padStart(2, '0')

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/** true se "YYYY-MM-DD" existe no calendário (recusa 2026-02-30, 2026-13-01). */
export function isValidCivilDate(value: string): boolean {
  const m = CIVIL_DATE_RE.exec(value)
  if (!m) return false
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  if (year < 1900 || year > 2200) return false
  if (month < 1 || month > 12 || day < 1) return false
  return day <= daysInMonth(year, month)
}

/** true se "YYYY-MM-DDTHH:MM" é uma data/hora existente. */
export function isValidDateTimeLocal(value: string): boolean {
  const m = DATETIME_LOCAL_RE.exec(value)
  if (!m) return false
  if (!isValidCivilDate(`${m[1]}-${m[2]}-${m[3]}`)) return false
  return Number(m[4]) <= 23 && Number(m[5]) <= 59
}

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: APP_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

interface ZonedParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function zonedParts(date: Date): ZonedParts {
  const p: Record<string, string> = {}
  for (const part of partsFormatter.formatToParts(date)) p[part.type] = part.value
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
  }
}

function toDate(value: string | Date): Date | null {
  const d = value instanceof Date ? value : new Date(value)
  return isNaN(d.getTime()) ? null : d
}

/** Dia civil BRT de um instante ("YYYY-MM-DD"). */
export function toCivilDateBRT(value: string | Date): string {
  const d = toDate(value)
  if (!d) return ''
  const p = zonedParts(d)
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`
}

/**
 * Dia civil de uma data de negócio (vencimento, data pura, pagamento).
 * Aceita "YYYY-MM-DD" (devolve a própria) ou ISO. Meia-noite UTC exata é
 * legado de data pura e vale como a própria data UTC.
 */
export function civilDateOf(value: string | Date): string {
  if (typeof value === 'string' && CIVIL_DATE_RE.test(value)) return value
  const d = toDate(value)
  if (!d) return ''
  if (
    d.getUTCHours() === 0 && d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0
  ) {
    return d.toISOString().slice(0, 10)
  }
  return toCivilDateBRT(d)
}

function civilToDisplay(civil: string): string {
  const m = CIVIL_DATE_RE.exec(civil)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

/** "dd/mm/aaaa" de uma data de negócio (vencimento, data pura, pagamento, criação). */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  return civilToDisplay(civilDateOf(value))
}

/** "dd/mm/aaaa HH:MM" de um instante, sempre no horário de Brasília. */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return ''
  if (typeof value === 'string' && CIVIL_DATE_RE.test(value)) return civilToDisplay(value)
  const d = toDate(value)
  if (!d) return ''
  const p = zonedParts(d)
  return `${pad2(p.day)}/${pad2(p.month)}/${p.year} ${pad2(p.hour)}:${pad2(p.minute)}`
}

/** "HH:MM" de um instante no horário de Brasília. */
export function formatTimeBRT(value: string | Date): string {
  const d = toDate(value)
  if (!d) return ''
  const p = zonedParts(d)
  return `${pad2(p.hour)}:${pad2(p.minute)}`
}

/** Data de um evento (instante) no horário de Brasília: "dd/mm/aaaa". */
export function formatEventDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  return civilToDisplay(toCivilDateBRT(value))
}

/** Formata com opções do Intl, forçando o fuso de Brasília. */
export function formatIntlBRT(value: string | Date, options: Intl.DateTimeFormatOptions): string {
  const d = toDate(value)
  if (!d) return ''
  return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: APP_TIME_ZONE }).format(d)
}

/**
 * Instante -> "YYYY-MM-DDTHH:MM" no horário de Brasília (valor de um
 * DateTimeInput ao editar um evento). O back interpreta esse formato como BRT.
 */
export function toDateTimeLocalBRT(value: string | Date | null | undefined): string {
  if (!value) return ''
  const d = toDate(value)
  if (!d) return ''
  const p = zonedParts(d)
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`
}

/** Hoje em Brasília ("YYYY-MM-DD"). */
export function todayBRT(now: Date = new Date()): string {
  return toCivilDateBRT(now)
}

/** Ano e mês (0-11) correntes em Brasília. */
export function currentYearMonthBRT(now: Date = new Date()): { year: number; month: number } {
  const p = zonedParts(now)
  return { year: p.year, month: p.month - 1 }
}

/** Competência "YYYY-MM" a partir de ano e mês 0-11. */
export function toCompetence(year: number, month0: number): string {
  return `${year}-${pad2(month0 + 1)}`
}

/** Primeiro e último dia civil ("YYYY-MM-DD") de um mês (0-11). */
export function monthCivilRange(year: number, month0: number): { start: string; end: string } {
  return {
    start: `${year}-${pad2(month0 + 1)}-01`,
    end: `${year}-${pad2(month0 + 1)}-${pad2(daysInMonth(year, month0 + 1))}`,
  }
}

/** "2026-11" -> "Novembro/2026". Devolve a entrada se não for competência. */
export function formatCompetence(value: string | null | undefined): string {
  if (!value) return ''
  const m = /^(\d{4})-(\d{2})$/.exec(value)
  if (!m) return value
  const name = MONTH_NAMES[Number(m[2]) - 1]
  return name ? `${name}/${m[1]}` : value
}

/** Milissegundos para ordenar datas de negócio (data pura ou ISO). */
export function dateSortKey(value: string | null | undefined): number {
  if (!value) return 0
  if (CIVIL_DATE_RE.test(value)) return new Date(`${value}T12:00:00Z`).getTime()
  const t = new Date(value).getTime()
  return isNaN(t) ? 0 : t
}

/**
 * Filtro de eventos de um mês (0-11) em horário de Brasília, no formato que o
 * back interpreta como BRT ("YYYY-MM-DDTHH:MM" sem fuso).
 */
export function monthEventRange(year: number, month0: number): { startAfter: string; startBefore: string } {
  const { start, end } = monthCivilRange(year, month0)
  return { startAfter: `${start}T00:00`, startBefore: `${end}T23:59` }
}

/** Rótulo do dia "10 - Terça-feira" de um "YYYY-MM-DD" (sem depender do fuso do browser). */
export function formatDayLabel(civil: string): string {
  const m = CIVIL_DATE_RE.exec(civil)
  if (!m) return civil
  // Meio-dia UTC do dia civil cai no mesmo dia em BRT.
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'UTC' })
    .format(new Date(`${civil}T12:00:00Z`))
  return `${Number(m[3])} - ${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`
}
