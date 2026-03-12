'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={cn('pr-9', className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground"
        onClick={() => setVisible((prev) => !prev)}
        tabIndex={-1}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  )
})

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
