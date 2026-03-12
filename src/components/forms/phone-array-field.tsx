'use client'

import { Plus, Trash2 } from 'lucide-react'
import {
  useFieldArray,
  type Control,
  type FieldErrors,
} from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { FormField } from '@/components/forms/form-field'
import { MaskedInput } from '@/components/forms/masked-input'

interface PhoneArrayFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: FieldErrors<any>
  label?: string
  max?: number
}

export function PhoneArrayField({
  control,
  name,
  errors,
  label = 'Telefones',
  max = 5,
}: PhoneArrayFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  })

  const fieldErrors = errors?.[name] as
    | Record<string, { value?: { message?: string } }>
    | undefined

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {fields.length < max && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => append({ value: '' })}
          >
            <Plus data-icon="inline-start" />
            Adicionar
          </Button>
        )}
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Nenhum telefone adicionado.
        </p>
      )}

      {fields.map((field, index) => {
        const error = fieldErrors?.[index]?.value
        return (
          <div key={field.id} className="flex items-start gap-2">
            <FormField
              label={`Telefone ${index + 1}`}
              name={`${name}.${index}.value`}
              error={error as any}
              className="flex-1"
            >
              <MaskedInput
                mask="phone"
                id={`${name}.${index}.value`}
                placeholder="(00) 00000-0000"
                {...control.register(`${name}.${index}.value`)}
              />
            </FormField>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-6 text-destructive hover:text-destructive"
              onClick={() => remove(index)}
              aria-label={`Remover telefone ${index + 1}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
