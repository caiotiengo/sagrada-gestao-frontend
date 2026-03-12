// ========================================
// Sagrada Gestão - Utilities
// ========================================

export function formatCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function formatCNPJ(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

export function formatPhone(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

export function formatRG(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1})$/, '$1-$2')
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(date + 'T00:00:00')
    : new Date(date)
  return new Intl.DateTimeFormat('pt-BR').format(d)
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(date + 'T00:00:00')
    : new Date(date)
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d)
}

export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return false
  if (/^(\d)\1+$/.test(cleaned)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i)
  let rest = (sum * 10) % 11
  if (rest === 10) rest = 0
  if (rest !== parseInt(cleaned[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i)
  rest = (sum * 10) % 11
  if (rest === 10) rest = 0
  return rest === parseInt(cleaned[10])
}

export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return false
  if (/^(\d)\1+$/.test(cleaned)) return false

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let sum = 0
  for (let i = 0; i < 12; i++) sum += parseInt(cleaned[i]) * weights1[i]
  let rest = sum % 11
  const digit1 = rest < 2 ? 0 : 11 - rest

  sum = 0
  for (let i = 0; i < 13; i++) sum += parseInt(cleaned[i]) * weights2[i]
  rest = sum % 11
  const digit2 = rest < 2 ? 0 : 11 - rest

  return parseInt(cleaned[12]) === digit1 && parseInt(cleaned[13]) === digit2
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function maskValue(value: string, type: 'cpf' | 'cnpj' | 'phone' | 'rg'): string {
  const formatters: Record<string, (v: string) => string> = {
    cpf: formatCPF,
    cnpj: formatCNPJ,
    phone: formatPhone,
    rg: formatRG,
  }
  return formatters[type]?.(value) ?? value
}
