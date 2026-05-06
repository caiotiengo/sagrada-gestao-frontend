import type { LedgerSource, LedgerChannel, LedgerStatus, LedgerDirection } from '@/types/ledger'

export const SOURCE_LABELS: Record<LedgerSource, string> = {
  monthlyFee: 'Mensalidade',
  helpQuota: 'Cota de campanha',
  externalContribution: 'Contribuição externa',
  raffleReservation: 'Rifa',
  storeSale: 'Loja/Cantina',
  debt: 'Dívida',
  shoppingItem: 'Trabalho/Jogo',
  payment: 'Pagamento avulso',
  manual: 'Manual',
}

export const CHANNEL_LABELS: Record<LedgerChannel, string> = {
  cash: 'Dinheiro',
  pix: 'PIX',
  card: 'Cartão',
  transfer: 'Transferência',
  internal: 'Interno',
  other: 'Outro',
}

/**
 * Resolve channel label, falling back to "PIX" for legacy values
 * (pix_cora, pix_manual) that may still exist in old ledger entries.
 */
export function channelLabel(channel: string): string {
  if (channel.startsWith('pix')) return 'PIX'
  return CHANNEL_LABELS[channel as LedgerChannel] ?? channel
}

export const STATUS_LABELS: Record<LedgerStatus, string> = {
  confirmed: 'Confirmado',
  pending: 'Pendente',
  reversed: 'Estornado',
}

export const STATUS_VARIANTS: Record<LedgerStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  confirmed: 'default',
  pending: 'outline',
  reversed: 'destructive',
}

export const DIRECTION_LABELS: Record<LedgerDirection, string> = {
  credit: 'Entrada',
  debit: 'Saída',
}
