'use client'

import * as React from 'react'

import { Input } from '@/components/ui/input'

/**
 * Converts ISO datetime-local (YYYY-MM-DDTHH:MM) to DD/MM/AAAA HH:MM
 */
function isoToDisplay(iso: string): string {
  if (!iso) return ''
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (match) return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`
  return iso
}

/**
 * Converts DD/MM/AAAA HH:MM to YYYY-MM-DDTHH:MM
 */
function displayToIso(digits: string): string {
  if (digits.length !== 12) return ''
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)
  const hour = digits.slice(8, 10)
  const minute = digits.slice(10, 12)
  return `${year}-${month}-${day}T${hour}:${minute}`
}

/**
 * Applies DD/MM/AAAA HH:MM mask to raw digits.
 */
function maskDateTime(digits: string): string {
  const d = digits.slice(0, 12)
  if (d.length >= 11) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4, 8)} ${d.slice(8, 10)}:${d.slice(10)}`
  if (d.length >= 9) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4, 8)} ${d.slice(8)}`
  if (d.length >= 5) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
  if (d.length >= 3) return `${d.slice(0, 2)}/${d.slice(2)}`
  return d
}

interface DateTimeInputProps
  extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> {
  /** Value in ISO format: YYYY-MM-DDTHH:MM */
  value: string
  /** Called with ISO format: YYYY-MM-DDTHH:MM (or '' if incomplete) */
  onValueChange?: (iso: string) => void
}

const DateTimeInput = React.forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ value, onValueChange, placeholder = 'DD/MM/AAAA HH:MM', ...props }, ref) => {
    const [display, setDisplay] = React.useState(() => isoToDisplay(value))

    // Sync display when the external value changes (e.g. form reset)
    React.useEffect(() => {
      const expected = isoToDisplay(value)
      if (value && expected) {
        setDisplay(expected)
      } else if (!value) {
        setDisplay('')
      }
    }, [value])

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const raw = event.target.value.replace(/\D/g, '').slice(0, 12)
      const masked = maskDateTime(raw)

      setDisplay(masked)

      if (raw.length === 12) {
        onValueChange?.(displayToIso(raw))
      } else {
        onValueChange?.('')
      }
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
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        maxLength={16}
        value={display}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    )
  }
)

DateTimeInput.displayName = 'DateTimeInput'

export { DateTimeInput }
