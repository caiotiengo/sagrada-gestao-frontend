// Troca de plano na página "Plano e cobrança": o que acontece em cada caso.
// Espelha a regra do back (functions/src/modules/billing/billing.service.ts,
// changeSubscriptionPlan). Sem dependências, para rodar no `npm test`.

export type PlanChangeKind = 'trial' | 'upgrade' | 'downgrade' | 'pix' | 'none'

export interface PlanChangeInput {
  /** Plano/intervalo atuais da assinatura. */
  currentPlan: string
  currentInterval: 'month' | 'year' | null
  targetPlan: string
  targetInterval: 'month' | 'year'
  /** Ordem dos planos do catálogo (menor → maior). */
  planOrder: string[]
  status: string
  billingMode: 'none' | 'stripe' | 'pix'
}

/** "Tamanho": plano primeiro; no mesmo plano, anual > mensal. */
export function planRank(planOrder: string[], plan: string, interval: 'month' | 'year' | null): number {
  return planOrder.indexOf(plan) * 2 + (interval === 'year' ? 1 : 0)
}

export function planChangeKind(i: PlanChangeInput): PlanChangeKind {
  if (i.targetPlan === i.currentPlan && i.targetInterval === i.currentInterval) return 'none'
  if (i.billingMode === 'pix') return 'pix'
  if (i.status === 'trialing') return 'trial'
  return planRank(i.planOrder, i.targetPlan, i.targetInterval) > planRank(i.planOrder, i.currentPlan, i.currentInterval ?? 'month')
    ? 'upgrade'
    : 'downgrade'
}

export interface PlanChangeTexts {
  targetName: string
  currentName: string
  /** Preço do plano de destino já formatado (ex.: "R$ 54,90/mês"). */
  targetPrice: string
  /** Datas já formatadas (dd/mm/aaaa). */
  trialEnd?: string
  periodEnd?: string
  /** Limite de pessoas do plano de destino e pessoas ativas hoje. */
  targetLimit: number | null
  activeMembers: number
}

/** Texto da confirmação: explica o efeito antes de trocar. */
export function planChangeExplanation(kind: PlanChangeKind, t: PlanChangeTexts): string[] {
  const lines: string[] = []
  switch (kind) {
    case 'trial':
      lines.push(`A troca vale agora e seus dias grátis continuam: nada é cobrado até ${t.trialEnd ?? 'o fim do teste'}.`)
      lines.push(`A primeira cobrança já sai no ${t.targetName} (${t.targetPrice}).`)
      break
    case 'upgrade':
      lines.push(`O ${t.targetName} vale agora.`)
      lines.push('A diferença proporcional ao que falta do período atual é cobrada na hora, na forma de pagamento da assinatura. Depois, as renovações saem no valor do plano novo.')
      break
    case 'downgrade':
      lines.push(`A troca vale a partir de ${t.periodEnd ?? 'o fim do período pago'}. Até lá a casa continua no ${t.currentName}, que já está pago.`)
      lines.push(`A partir daí, a cobrança passa a ser de ${t.targetPrice}.`)
      break
    case 'pix':
      lines.push(`Nada muda no período já pago${t.periodEnd ? ` (até ${t.periodEnd})` : ''}. O ${t.targetName} vale a partir do próximo pagamento por PIX (${t.targetPrice}).`)
      break
    default:
      break
  }
  if (kind !== 'none' && t.targetLimit !== null && t.activeMembers > t.targetLimit) {
    lines.push(`Atenção: a casa tem ${t.activeMembers} pessoas ativas e o ${t.targetName} permite ${t.targetLimit}. Desative antes quem não participa mais.`)
  }
  return lines
}
