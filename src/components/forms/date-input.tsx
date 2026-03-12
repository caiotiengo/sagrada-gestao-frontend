'use client'

import * as React from 'react'

import { Input } from '@/components/ui/input'

/**
 * Converts YYYY-MM-DD to DD/MM/AAAA for display.
 */
function isoToDisplay(iso: string): string {
  if (!iso) return ''
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
  let d = digits.slice(0, 8)
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
      const raw = event.target.value.replace(/\D/g, '').slice(0, 8)
      const masked = maskDate(raw)

      setDisplay(masked)

      // Only emit ISO when we have a full date
      if (raw.length === 8) {
        onValueChange?.(displayToIso(masked))
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
        maxLength={10}
        value={display}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    )
  }
)

DateInput.displayName = 'DateInput'

export { DateInput }
