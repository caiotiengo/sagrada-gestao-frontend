import { ledgerService } from '@/services/ledger'
import { SOURCE_LABELS, STATUS_LABELS, channelLabel } from '@/lib/ledger-labels'
import type { LedgerEntryView } from '@/types/ledger'
import { formatCurrency } from '@/utils'
import { formatDate } from '@/utils/dates'

const PAGE_SIZE = 100
const MAX_PAGES = 50

/**
 * Busca todos os lançamentos do extrato unificado (ledger) num período.
 * É a mesma fonte do dashboard e do extrato: inclui mensalidades, pagamentos
 * avulsos, pagamentos de dívida, vendas, rifas, cotas, estornos etc.
 */
export async function fetchStatementEntries(params: {
  houseId: string
  startDate: string
  endDate: string
  memberId?: string
}): Promise<LedgerEntryView[]> {
  const entries: LedgerEntryView[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await ledgerService.getFinancialStatement({ ...params, page, limit: PAGE_SIZE })
    entries.push(...(res.data ?? []))
    if (!res.pagination?.hasNext) break
  }
  return entries
}

export const STATEMENT_CSV_HEADERS = [
  'Data',
  'Descrição',
  'Tipo',
  'Valor',
  'Origem',
  'Pessoa',
  'Forma de pagamento',
  'Situação',
]

export function statementCsvRows(
  entries: LedgerEntryView[],
  memberName: (memberId: string | null) => string,
): string[][] {
  return entries.map((e) => {
    const signed = e.direction === 'credit' ? e.amount : -e.amount
    const tipo = e.isReversal
      ? 'Estorno'
      : e.direction === 'credit' ? 'Entrada' : 'Saída'
    return [
      formatDate(e.occurredAt || e.createdAt),
      e.description ?? '',
      tipo,
      formatCurrency(signed),
      SOURCE_LABELS[e.source] ?? e.source,
      memberName(e.memberId),
      e.channel ? channelLabel(e.channel) : '',
      e.isReversal ? 'Estorno' : (STATUS_LABELS[e.status] ?? e.status),
    ]
  })
}
