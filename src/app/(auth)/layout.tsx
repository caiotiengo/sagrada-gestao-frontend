import { Fraunces } from 'next/font/google'
import { ArrowLeft } from 'lucide-react'

import { BrandMark } from '@/components/landing/brand'
import { APP_NAME, siteUrl } from '@/constants'
import { cn } from '@/lib/utils'

// Mesma fonte de títulos da landing (src/app/page.tsx)
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  axes: ['SOFT', 'opsz'],
  style: ['normal', 'italic'],
  display: 'swap',
})

/** Céu da landing + cabeçalho com volta para o site (domínio raiz). */
export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No app.<domínio> o "/" vai para o login; a landing mora no domínio raiz
  const home = siteUrl('/') || '/'
  return (
    <div className={cn('auth-brand landing-sky relative isolate flex min-h-dvh flex-col overflow-x-clip text-white', fraunces.variable)}>
      <div className="landing-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[48rem]" aria-hidden="true" />
      <header className="relative z-10 mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href={home}
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <BrandMark className="size-9" tone="gold" />
          <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
        </a>
        <a
          href={home}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar
        </a>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
