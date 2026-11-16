'use client'

import Link from 'next/link'
import { ArrowRight, Megaphone } from 'lucide-react'
import { useNotices } from '@/hooks/use-notices'
import { NoticeCard } from '@/components/notices/notice-card'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/** Últimos avisos (fixados primeiro) para a home do membro e o painel do admin. */
export function NoticesWidget({ href, max = 3 }: { href: string; max?: number }) {
  const { data, isLoading, isError } = useNotices(1, false, max)
  const notices = data?.data ?? []
  const total = data?.pagination.total ?? 0

  return (
    <section className="mt-8" aria-labelledby="notices-widget-title">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="notices-widget-title" className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Megaphone className="size-4 text-primary" />
          Mural de avisos
        </h2>
        <Link href={href} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          {total > notices.length ? `Ver todos (${total})` : 'Ver mural'}
          <ArrowRight className="size-3" />
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : isError ? (
        <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">Não foi possível carregar os avisos.</CardContent></Card>
      ) : notices.length > 0 ? (
        <div className="space-y-2">
          {notices.map((n) => <NoticeCard key={n.id} notice={n} compact />)}
        </div>
      ) : (
        <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">Nenhum aviso no momento</CardContent></Card>
      )}
    </section>
  )
}
