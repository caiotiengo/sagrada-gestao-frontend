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
  pix_cora: 'PIX (Cora)',
  pix_manual: 'PIX (manual)',
  card: 'Cartão',
  transfer: 'Transferência',
  internal: 'Interno',
  other: 'Outro',
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
