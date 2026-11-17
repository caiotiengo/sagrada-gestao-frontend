// ========================================
// Planos da landing page
// ----------------------------------------
// PROPOSTA A CONFIRMAR PELO CAIO. Nada aqui está cobrado nem aplicado no
// sistema: não há checkout, e os limites (pessoas, recursos) ainda não são
// verificados pelo backend. O botão de cada plano só leva ao cadastro da casa.
//
// Referência de mercado (lida em 17/11/2026): app de gestão de terreiro em
// plano único de R$ 67/mês (≈ R$ 804/ano), sem plano gratuito nem anual na
// página. Todos os valores abaixo ficam abaixo disso, inclusive o maior.
//
// Site da casa: decisão do Caio (17/11/2026) de incluí-lo no plano gratuito.
// É o argumento de entrada ("seu terreiro na internet, de graça"), então ele
// aparece no Semente e, por herança ("Tudo do Semente"), nos pagos.
// ========================================

export interface Plan {
  id: 'semente' | 'casa' | 'casa-grande'
  name: string
  /** Frase curta: para quem é o plano. */
  tagline: string
  /** Preço mensal em centavos (0 = gratuito). */
  monthlyCents: number
  /** Preço do ano à vista em centavos (0 = gratuito). */
  yearlyCents: number
  /** Limite de pessoas cadastradas na casa (null = sem limite). */
  memberLimit: number | null
  features: string[]
  highlighted?: boolean
  cta: string
}

export const PLANS: Plan[] = [
  {
    id: 'semente',
    name: 'Semente',
    tagline: 'Para começar a organizar uma casa pequena.',
    monthlyCents: 0,
    yearlyCents: 0,
    memberLimit: 15,
    features: [
      'Mensalidades com baixa e extrato',
      'Agenda de eventos com confirmação de presença',
      'Avisos no mural',
      'Convite por link',
      'Chave PIX da casa para copiar',
      'Site da casa com endereço próprio, grátis',
    ],
    cta: 'Começar grátis',
  },
  {
    id: 'casa',
    name: 'Casa',
    tagline: 'Tudo o que a casa precisa no dia a dia.',
    monthlyCents: 3490,
    yearlyCents: 34900,
    memberLimit: 100,
    features: [
      'Tudo do Semente',
      'Cantina e loja com estoque, balcão e fiado',
      'Rifas com sorteio auditável',
      'Listas e campanhas com cotas',
      'Pedidos da cantina e rifas também pelo site da casa',
      'Notificações no celular',
      'Permissões por função (tesouraria, cantina, agenda)',
    ],
    highlighted: true,
    cta: 'Criar a conta da casa',
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
      'Ajuda para cadastrar a lista de membros',
    ],
    cta: 'Criar a conta da casa',
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
