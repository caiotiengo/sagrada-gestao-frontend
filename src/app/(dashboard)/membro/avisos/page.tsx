'use client'

import { useState } from 'react'
import { Megaphone } from 'lucide-react'
import { useNotices } from '@/hooks/use-notices'
import { NoticeCard } from '@/components/notices/notice-card'
import { ListSkeleton } from '@/components/feedback/list-skeleton'
import { ErrorState } from '@/components/feedback/error-state'
import { EmptyState } from '@/components/feedback/empty-state'
import { Button } from '@/components/ui/button'

export default function MemberNoticesPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useNotices(page)
  const notices = data?.data ?? []
  const totalPages = data?.pagination.totalPages ?? 1

  if (isError) {
    return <ErrorState title="Erro ao carregar avisos" message="Não foi possível carregar o mural." onRetry={() => refetch()} />
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Mural de avisos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Avisos da liderança da casa</p>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : notices.length > 0 ? (
        <div className="space-y-3">
          {notices.map((notice) => <NoticeCard key={notice.id} notice={notice} />)}
        </div>
      ) : (
        <EmptyState
          icon={Megaphone}
          title="Nenhum aviso no mural"
          description="Quando a liderança publicar um aviso, ele aparece aqui."
          className="min-h-[30dvh]"
        />
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">{page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Próximo
          </Button>
        </div>
      )}
    </div>
  )
}
