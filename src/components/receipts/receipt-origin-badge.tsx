import { Receipt } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

/** Selo dos lançamentos que vieram de um comprovante PIX (`origin === 'receipt'`). */
export function ReceiptOriginBadge({ origin }: { origin?: string | null }) {
  if (origin !== 'receipt') return null
  return (
    <Badge
      variant="outline"
      className="border-violet-300 bg-violet-50 text-xs text-violet-800 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300"
      title="Baixa feita por comprovante PIX"
      data-testid="receipt-origin-badge"
    >
      <Receipt aria-hidden />
      Comprovante
    </Badge>
  )
}
