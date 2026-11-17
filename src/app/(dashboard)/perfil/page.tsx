'use client'

import Link from 'next/link'
import { Bell, ChevronRight, FileText, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/constants'
import { DeleteAccountSection } from '@/components/account/delete-account-section'

const LINKS = [
  { href: ROUTES.NOTIFICATION_SETTINGS, label: 'Notificações', icon: Bell },
  { href: ROUTES.PRIVACY, label: 'Política de privacidade', icon: ShieldCheck },
  { href: ROUTES.TERMS, label: 'Termos de uso', icon: FileText },
]

export default function ProfilePage() {
  const { profile } = useAuthStore()

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Minha conta</h1>
        <p className="text-sm text-muted-foreground">Seus dados de acesso e a exclusão da conta.</p>
      </div>

      <section aria-label="Dados da conta" className="rounded-xl border bg-card p-4 sm:p-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Nome</dt>
            <dd className="font-medium">{profile?.fullName || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">E-mail</dt>
            <dd className="font-medium break-all">{profile?.email || '—'}</dd>
          </div>
        </dl>
      </section>

      <nav aria-label="Configurações" className="divide-y rounded-xl border bg-card">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:px-5"
          >
            <Icon className="size-4 text-muted-foreground" aria-hidden />
            <span className="flex-1">{label}</span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </Link>
        ))}
      </nav>

      <DeleteAccountSection />
    </div>
  )
}
