'use client'

import * as React from 'react'

import { Input } from '@/components/ui/input'

/**
 * Formats a cents integer to Brazilian currency display: 1.234,56
 * Does NOT include "R$" prefix — that should be in the label/placeholder.
 */
function formatCentsToDisplay(cents: number): string {
  if (cents === 0) return ''
  const reais = Math.floor(cents / 100)
  const centavos = cents % 100
  const reaisStr = reais.toLocaleString('pt-BR')
  return `${reaisStr},${String(centavos).padStart(2, '0')}`
}

/**
 * Parses a display string (e.g. "1.234,56") back to cents integer.
 */
function displayToCents(display: string): number {
  const digits = display.replace(/\D/g, '')
  return parseInt(digits, 10) || 0
}

interface CurrencyInputProps
  extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> {
  /** Value in reais (e.g. 12.50). This is what the parent state holds. */
  value: number | string
  /** Called with the numeric value in reais (e.g. 12.50) */
  onValueChange?: (value: number) => void
  /** Standard onChange — event.target.value will be the display string */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, onChange, placeholder = 'R$ 0,00', ...props }, ref) => {
    // Convert the external value (reais) to cents for internal tracking
    const externalCents = React.useMemo(() => {
      const num = typeof value === 'string' ? parseFloat(value) || 0 : value || 0
      return Math.round(num * 100)
    }, [value])

    const displayValue = formatCentsToDisplay(externalCents)

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const raw = event.target.value.replace(/\D/g, '')

      // Limit to prevent absurd values (max R$ 9.999.999,99)
      if (raw.length > 11) return

      const cents = parseInt(raw, 10) || 0
      const reais = cents / 100

      // Update display
      const formatted = formatCentsToDisplay(cents)
      event.target.value = formatted

      onValueChange?.(reais)
      onChange?.(event)
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
      // Allow: backspace, delete, tab, escape, enter, arrows
      const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
      if (allowed.includes(event.key)) return

      // Allow Ctrl/Cmd + A, C, V, X
      if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) return

      // Block non-digit
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
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
