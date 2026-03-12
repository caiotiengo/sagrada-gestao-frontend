'use client'

import { type FieldError } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  name: string
  error?: FieldError
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  name,
  error,
  description,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error.message}</p>
      )}
    </div>
  )
}
