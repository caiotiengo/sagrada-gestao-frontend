import type { RaffleItem } from '@/types'

/**
 * Números pagos x reservados. `soldNumbers` conta os dois (ocupados); o back
 * novo manda `paidNumbers`/`reservedNumbers`. Sem eles, usa a lista de números
 * do detalhe; sem nada, trata tudo como reservado (não chama de "vendido").
 */
export function raffleCounts(raffle: RaffleItem & { numbers?: { isPaid?: boolean | null }[] }) {
  const occupied = raffle.soldNumbers ?? 0
  let paid = raffle.paidNumbers
  if (paid === undefined && raffle.numbers) paid = raffle.numbers.filter((n) => n.isPaid === true).length
  paid = Math.min(paid ?? 0, occupied)
  const reserved = raffle.reservedNumbers ?? Math.max(0, occupied - paid)
  return { paid, reserved, occupied }
}

/** "3 pagos · 2 reservados de 100" */
export function raffleCountsLabel(raffle: Parameters<typeof raffleCounts>[0]): string {
  const { paid, reserved } = raffleCounts(raffle)
  return `${paid} pago${paid === 1 ? '' : 's'} · ${reserved} reservado${reserved === 1 ? '' : 's'} de ${raffle.totalNumbers}`
}
