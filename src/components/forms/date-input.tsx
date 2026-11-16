'use client'

import * as React from 'react'

import { Input } from '@/components/ui/input'
import { civilDateOf, isValidCivilDate } from '@/utils/dates'

/**
 * Converts YYYY-MM-DD to DD/MM/AAAA for display.
 */
function isoToDisplay(value: string): string {
  if (!value) return ''
  // ISO completo (ex.: vencimento gravado como fim do dia BRT) vira o dia civil BRT
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : civilDateOf(value) || value
  // Handle YYYY-MM-DD
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return `${match[3]}/${match[2]}/${match[1]}`
  return iso
}

/**
 * Converts DD/MM/AAAA to YYYY-MM-DD for API.
 */
function displayToIso(display: string): string {
  const clean = display.replace(/\D/g, '')
  if (clean.length !== 8) return ''
  const day = clean.slice(0, 2)
  const month = clean.slice(2, 4)
  const year = clean.slice(4, 8)
  return `${year}-${month}-${day}`
}

/**
 * Applies DD/MM/AAAA mask to raw digits.
 */
function maskDate(digits: string): string {
  const d = digits.slice(0, 8)
  if (d.length >= 5) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
  if (d.length >= 3) return `${d.slice(0, 2)}/${d.slice(2)}`
  return d
}

interface DateInputProps
  extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> {
  /** Value in ISO format: YYYY-MM-DD */
  value: string
  /** Called with ISO format: YYYY-MM-DD (or '' if incomplete) */
  onValueChange?: (iso: string) => void
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onValueChange, placeholder = 'DD/MM/AAAA', ...props }, ref) => {
    const [display, setDisplay] = React.useState(() => isoToDisplay(value))
    const [invalid, setInvalid] = React.useState(false)

    // Último valor emitido: só sincroniza o texto quando o valor muda por fora
    // (ex.: reset do form), não a cada tecla digitada.
    const lastEmitted = React.useRef(value)

    // Sync display when the external value changes (e.g. form reset)
    React.useEffect(() => {
      if (value === lastEmitted.current) return
      lastEmitted.current = value
      setDisplay(value ? isoToDisplay(value) : '')
      setInvalid(false)
    }, [value])

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const raw = event.target.value.replace(/\D/g, '').slice(0, 8)
      const masked = maskDate(raw)

      setDisplay(masked)

      // Only emit ISO when we have a full date that exists (recusa 31/02, 99/99)
      const iso = raw.length === 8 ? displayToIso(masked) : ''
      const ok = !!iso && isValidCivilDate(iso)
      setInvalid(raw.length === 8 && !ok)
      lastEmitted.current = ok ? iso : ''
      onValueChange?.(ok ? iso : '')
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
      const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
      if (allowed.includes(event.key)) return
      if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) return
      if (!/^\d$/.test(event.key)) {
        event.preventDefault()
      }
    }

    return (
      <>
      <Input
        {...props}
        aria-invalid={invalid || props['aria-invalid']}
        ref={ref}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        maxLength={10}
        value={display}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {invalid && (
        <p className="text-xs text-destructive">Data inválida</p>
      )}
      </>
    )
  }
)

DateInput.displayName = 'DateInput'

export { DateInput }
