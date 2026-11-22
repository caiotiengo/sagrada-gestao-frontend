'use client'

import { AuthCard } from '@/components/landing/auth-brand'

interface AuthLayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * Cartão centralizado das telas de entrada. Fundo, logo e "Voltar" vêm de
 * src/app/(auth)/layout.tsx (visual da landing).
 */
export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 pt-4 pb-12 sm:px-6">
      <div className="w-full max-w-sm">
        <AuthCard className={className}>{children}</AuthCard>
      </div>
    </div>
  )
}
