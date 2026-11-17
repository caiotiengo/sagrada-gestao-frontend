// ========================================
// Planos da landing page
// ----------------------------------------
// CÓPIA DE VITRINE. A fonte da verdade é functions/src/constants/plans.ts do
// back: lá estão os preços, o limite de pessoas ativas e os recursos pagos que
// o backend bloqueia (cantina/loja, rifas, campanhas, listas, pedidos e
// reservas pelo site, push e permissões por função). Mudou lá, mude aqui.
// Não há plano grátis (decisão do Caio, 17/11/2026): toda casa nova tem 14 dias
// de teste sem cartão, com tudo liberado; depois assina Casa ou Casa Grande
// (PIX, boleto ou cartão) em Gestão > Plano e cobrança. O site da casa é
// incluso em todos os planos e no teste.
//
// Referência de mercado (lida em 17/11/2026): app de gestão de terreiro em
// plano único de R$ 67/mês (≈ R$ 804/ano), sem plano gratuito nem anual na
// página. Os dois planos ficam abaixo disso.
// ========================================

export interface Plan {
  id: 'casa' | 'casa-grande'
  name: string
  /** Frase curta: para quem é o plano. */
  tagline: string
  /** Preço mensal em centavos. */
  monthlyCents: number
  /** Preço do ano à vista em centavos. */
  yearlyCents: number
  /** Limite de pessoas cadastradas na casa (null = sem limite). */
  memberLimit: number | null
  features: string[]
  highlighted?: boolean
  cta: string
}

export const PLANS: Plan[] = [
  {
    id: 'casa',
    name: 'Casa',
    tagline: 'Tudo o que a casa precisa no dia a dia.',
    monthlyCents: 3490,
    yearlyCents: 34900,
    memberLimit: 100,
    features: [
      'Mensalidades com baixa, extrato e o "O que eu devo" de cada filho',
      'Agenda com confirmação de presença, avisos e check-in',
      'Cantina e loja com estoque, balcão e fiado',
      'Rifas com sorteio auditável, listas e campanhas com cotas',
      'Site da casa com endereço próprio, incluso',
      'Pedidos da cantina e rifas também pelo site da casa',
      'Notificações no celular',
      'Permissões por função (tesouraria, cantina, agenda)',
    ],
    highlighted: true,
    cta: 'Testar 14 dias grátis',
  },
  {
    id: 'casa-grande',
    name: 'Casa Grande',
    tagline: 'Para casas com muita gente e muita atividade.',
    monthlyCents: 5490,
    yearlyCents: 54900,
    memberLimit: null,
    features: [
      'Tudo do Casa',
      'Pessoas sem limite',
      'Ajuda para cadastrar a lista de membros',
    ],
    cta: 'Testar 14 dias grátis',
  },
]

/** Faixa de preço citada na comparação (sem nome de concorrente). */
export const MARKET_REFERENCE_TEXT = 'Assinaturas de apps para terreiro costumam passar de R$ 60 por mês, em plano único.'

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Valor mensal equivalente do plano anual, em centavos (arredondado para baixo). */
export function yearlyAsMonthlyCents(plan: Plan): number {
  return Math.floor(plan.yearlyCents / 12)
}

/** Quantos meses o anual "dá de presente" em relação a 12 mensalidades. */
export function yearlyMonthsFree(plan: Plan): number {
  if (!plan.monthlyCents) return 0
  return Math.round((plan.monthlyCents * 12 - plan.yearlyCents) / plan.monthlyCents)
}
