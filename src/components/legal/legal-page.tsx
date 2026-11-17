import Link from 'next/link'

import { APP_NAME, ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import { BrandMark } from '@/components/landing/brand'

/**
 * Marcador visível de dado que depende da empresa (razão social, CNPJ,
 * e-mail do encarregado...). Precisa ser preenchido antes de publicar.
 */
export function ToConfirm({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-sg-gold/35 px-1 font-mono text-[0.85em] text-sg-fg ring-1 ring-sg-gold">
      [A CONFIRMAR: {children}]
    </mark>
  )
}

export const LEGAL_LINKS = [
  { href: ROUTES.PRIVACY, label: 'Política de privacidade' },
  { href: ROUTES.TERMS, label: 'Termos de uso' },
  { href: ROUTES.DELETE_ACCOUNT_INFO, label: 'Excluir conta' },
] as const

/** Casca das páginas públicas de texto legal (privacidade, termos, exclusão). */
export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string
  updatedAt: string
  children: React.ReactNode
}) {
  return (
    <div className="legal min-h-screen bg-sg-bg text-sg-fg">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-sg-card focus:px-3 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <header className="border-b border-sg-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href={ROUTES.HOME} className="flex items-center gap-2.5 rounded-lg">
            <BrandMark className="size-8" />
            <span className="text-sm font-semibold">{APP_NAME}</span>
          </Link>
          <Link href={ROUTES.LOGIN} className="text-sm font-medium text-sg-muted hover:text-sg-fg">
            Entrar
          </Link>
        </div>
      </header>

      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-sg-muted">Última atualização: {updatedAt}</p>
        <div className="legal-prose mt-8 space-y-4 text-[0.95rem] leading-relaxed">{children}</div>
      </main>

      <LegalFooter />
    </div>
  )
}

export function LegalFooter({ className }: { className?: string }) {
  return (
    <footer className={cn('border-t border-sg-line px-4 py-8 sm:px-6', className)}>
      <nav aria-label="Documentos" className="mx-auto flex max-w-3xl flex-wrap gap-x-5 gap-y-2 text-sm text-sg-muted">
        {LEGAL_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-sg-fg">
            {l.label}
          </Link>
        ))}
      </nav>
    </footer>
  )
}

/** Título de seção com âncora. */
export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-6 pt-6 text-xl font-semibold tracking-tight">
      {children}
    </h2>
  )
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-2 font-semibold">{children}</h3>
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-5">{children}</ul>
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-sg-primary underline underline-offset-4">
      {children}
    </Link>
  )
}
