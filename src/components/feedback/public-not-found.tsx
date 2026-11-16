import { SearchX } from 'lucide-react'
import { getErrorCode } from '@/lib/errors'

/** true quando a callable respondeu not-found (rascunho, cancelada, apagada). */
export function isNotFoundError(error: unknown): boolean {
  return getErrorCode(error) === 'functions/not-found'
}

interface PublicNotFoundProps {
  /** Ex.: "Rifa", "Lista". */
  what: string
  /** Gênero do substantivo para a concordância ("encontrada"/"encontrado"). */
  feminine?: boolean
}

export function PublicNotFound({ what, feminine = true }: PublicNotFoundProps) {
  return (
    <div className="flex min-h-[40dvh] flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <SearchX className="size-10 text-muted-foreground" />
      <div>
        <p className="text-base font-semibold">
          {what} não {feminine ? 'encontrada' : 'encontrado'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {feminine ? 'Ela' : 'Ele'} não existe ou não está mais disponível. Confira o link com quem o enviou.
        </p>
      </div>
    </div>
  )
}
