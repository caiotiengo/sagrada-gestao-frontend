'use client'

import * as React from 'react'

import { Input } from '@/components/ui/input'
import { maskValue, onlyNumbers } from '@/utils'

type MaskType = 'cpf' | 'cnpj' | 'phone' | 'rg'

const maxLengths: Record<MaskType, number> = {
  cpf: 14,    // 000.000.000-00
  cnpj: 18,   // 00.000.000/0000-00
  phone: 15,  // (00) 00000-0000
  rg: 12,     // 00.000.000-0
}

interface MaskedInputProps
  extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  mask: MaskType
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, onChange, value, ...props }, ref) => {
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const raw = onlyNumbers(event.target.value)
      const masked = maskValue(raw, mask)

      event.target.value = masked

      onChange?.(event)
    }

    const displayValue =
      typeof value === 'string' ? maskValue(onlyNumbers(value), mask) : value

    return (
      <Input
        {...props}
        ref={ref}
        inputMode="numeric"
        maxLength={maxLengths[mask]}
        value={displayValue}
        onChange={handleChange}
      />
    )
  }
)

MaskedInput.displayName = 'MaskedInput'

export { MaskedInput }
export type { MaskType }
