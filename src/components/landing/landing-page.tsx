import Link from 'next/link'
import {
  ArrowRight,
  BellRing,
  BookOpenCheck,
  CalendarCheck,
  Check,
  ClipboardList,
  Clock,
  Gift,
  Globe,
  HandCoins,
  KeyRound,
  Link2,
  Lock,
  Megaphone,
  NotebookPen,
  Receipt,
  ShieldCheck,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Store,
  Ticket,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import { APP_NAME, ROUTES } from '@/constants'
import {
  MARKET_REFERENCE_TEXT,
  PLANS,
  formatBRL,
  yearlyAsMonthlyCents,
  yearlyMonthsFree,
} from '@/constants/plans'
import { cn } from '@/lib/utils'

import { BeadLine, BrandMark, LeafSprig } from './brand'
import { PhoneMockup, SiteMockup } from './mockups'

const LOGIN = ROUTES.LOGIN
const SIGNUP = ROUTES.REGISTER_ADMIN

const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2'
const btnGold = cn(btnBase, 'h-12 bg-sg-gold text-[#1b1c45] hover:bg-[#ecc677] focus-visible:ring-[#e1b75c]/60 focus-visible:ring-offset-[#121335]')
const btnPrimary = cn(btnBase, 'h-12 bg-sg-primary text-sg-primary-fg hover:opacity-90 focus-visible:ring-sg-primary/40 focus-visible:ring-offset-sg-bg')
const btnGhostDark = cn(btnBase, 'h-12 border border-white/25 text-white hover:bg-white/10 focus-visible:ring-white/40 focus-visible:ring-offset-[#121335]')

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-xs font-bold uppercase tracking-[0.18em] text-sg-gold-text', className)}>{children}</p>
  )
}

function SectionTitle({ id, eyebrow, title, intro, className }: { id: string; eyebrow: string; title: React.ReactNode; intro?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto max-w-2xl text-center', className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="font-display mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-4 text-base text-pretty text-sg-muted sm:text-lg">{intro}</p>}
    </div>
  )
}

/* ---------------------------------------------------------------- dados */

const PAINS: { before: string; after: string; icon: LucideIcon }[] = [
  {
    icon: NotebookPen,
    before: 'Mensalidade anotada no caderno, conferida uma por uma no fim do mês.',
    after: 'O mês da casa inteira lançado de uma vez; a baixa entra no extrato na hora.',
  },
  {
    icon: Megaphone,
    before: 'Cobrança no grupo do WhatsApp, com constrangimento para todo mundo.',
    after: 'Cada pessoa vê no celular o que tem em aberto e paga no PIX da casa.',
  },
  {
    icon: ShoppingBasket,
    before: 'Fiado da cantina no papel e estoque contado no olho.',
    after: 'Fiado no nome de cada um e estoque que baixa sozinho a cada venda.',
  },
  {
    icon: ClipboardList,
    before: 'Lista de presença em folha solta e rifa controlada em planilha.',
    after: 'Presença confirmada pelo app e rifa com números e sorteio registrados.',
  },
]

const FEATURE_GROUPS: { title: string; icon: LucideIcon; items: string[] }[] = [
  {
    title: 'Gestão financeira',
    icon: Wallet,
    items: [
      'Mensalidades lançadas em lote e baixa com forma de pagamento',
      'Extrato da casa com entradas e saídas, exportável em planilha',
      'Dívidas, fiado e cobranças avulsas por pessoa',
      '"O que eu devo": cada um vê o próprio saldo',
      'Chave PIX da casa sempre à mão para copiar',
    ],
  },
  {
    title: 'Cantina e loja',
    icon: Store,
    items: [
      'Itens com preço e estoque que baixa a cada venda',
      'Venda no balcão, no dinheiro, no PIX ou no fiado',
      'Fila de pedidos: pendente, pronto, pago',
      'Pedidos feitos pelo site da casa',
    ],
  },
  {
    title: 'Eventos e presença',
    icon: CalendarCheck,
    items: [
      'Agenda da casa com confirmação de presença',
      'Check-in na porta por busca ou QR, com painel ao vivo do evento (no app)',
      'Histórico de presença de cada pessoa',
      'Listas com inscrição para os trabalhos da casa',
    ],
  },
  {
    title: 'Comunidade',
    icon: Users,
    items: [
      'Convite por link para entrar na casa',
      'Avisos no mural e notificações no celular',
      'Rifas com sorteio auditável',
      'Campanhas e listas com cotas por pessoa',
      'Permissões por função: tesouraria, cantina, agenda, rifas',
    ],
  },
  {
    title: 'Site da casa',
    icon: Globe,
    items: [
      'Endereço próprio, com 3 modelos, cores e logo da casa',
      'Sobre a casa, próximos eventos e redes sociais',
      'Cantina e loja com pedido, rifas e listas públicas',
      'Opcional: liga e desliga quando quiser',
    ],
  },
  {
    title: 'App no celular',
    icon: Smartphone,
    items: [
      'Funciona no navegador do celular desde já',
      'App para Android e iPhone: em breve nas lojas',
      'No app: check-in por QR, balcão e o seu QR de presença',
    ],
  },
]

const STEPS: { title: string; text: string; icon: LucideIcon }[] = [
  {
    icon: UserPlus,
    title: 'Cadastre a casa',
    text: 'Seus dados, o nome e o endereço da casa e os dias de evento. Leva poucos minutos e não pede cartão.',
  },
  {
    icon: Link2,
    title: 'Convide quem é da casa',
    text: 'Mande o link de convite no grupo. Cada pessoa cria o próprio acesso e já entra na casa certa.',
  },
  {
    icon: Receipt,
    title: 'Cada um vê o que deve',
    text: 'A pessoa confere o que tem em aberto e paga no PIX da casa. A tesouraria dá a baixa e o extrato se atualiza.',
  },
]

const MONTH: { when: string; text: string }[] = [
  { when: 'Começo do mês', text: 'A tesouraria lança a mensalidade de todo mundo de uma vez, em vez de abrir o caderno nome por nome.' },
  { when: 'Durante o mês', text: 'Quem é da casa consulta o que deve sozinho. Ninguém precisa perguntar, ninguém precisa cobrar no grupo.' },
  { when: 'No dia do evento', text: 'A agenda já mostra quem confirmou; na porta, o check-in registra a presença.' },
  { when: 'Na cantina', text: 'Cada venda baixa o estoque e o fiado vai para o nome certo.' },
  { when: 'Fim do mês', text: 'O extrato está pronto para a prestação de contas, com exportação em planilha.' },
]

const PRIVACY: { title: string; text: string; icon: LucideIcon }[] = [
  { icon: Lock, title: 'Cada casa vê só os próprios dados', text: 'Os dados de uma casa não aparecem para outra. Quem é da casa vê só o que é seu.' },
  { icon: KeyRound, title: 'Permissão por função', text: 'Tesouraria, cantina, agenda, rifas: cada pessoa acessa só o que a casa liberou para ela.' },
  { icon: HandCoins, title: 'O dinheiro não passa por nós', text: 'O PIX vai direto para a chave da casa. O sistema só registra; quem dá a baixa é a tesouraria.' },
  { icon: BookOpenCheck, title: 'Sorteio que dá para conferir', text: 'Cada sorteio de rifa guarda a semente e a lista de números, para quem quiser refazer a conta.' },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Serve para qualquer tradição?',
    a: 'Sim. O Sagrada Gestão cuida só da parte administrativa: dinheiro, cantina, agenda, presença e comunicação. Terreiros, ilês, centros, tendas e roças usam do seu jeito, com os nomes e costumes da casa.',
  },
  {
    q: 'Preciso instalar alguma coisa?',
    a: 'Não. Funciona no navegador do celular e do computador. O app para Android e iPhone está a caminho das lojas.',
  },
  {
    q: 'O sistema recebe o dinheiro da casa?',
    a: 'Não. O pagamento vai direto para a chave PIX da casa (ou em dinheiro, no balcão). O sistema registra o que foi pago e o que está em aberto.',
  },
  {
    q: 'Quem da casa consegue ver o quê?',
    a: 'A administração escolhe. Cada pessoa vê o próprio saldo, a agenda e os avisos; tesouraria, cantina e agenda só aparecem para quem tem essa função.',
  },
  {
    q: 'Minha casa é pequena. Vale a pena?',
    a: 'Vale. O plano Semente é gratuito para casas pequenas e você pode mudar de plano quando a casa crescer.',
  },
  {
    q: 'Preciso ter o site da casa?',
    a: 'Não. O site é opcional. Quando ligado, mostra o que a casa quiser: sobre, eventos, redes sociais, cantina, rifas e listas.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Pode. Não há fidelidade nem multa.',
  },
]

const NAV = [
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#site-da-casa', label: 'Site da casa' },
  { href: '#planos', label: 'Planos' },
  { href: '#duvidas', label: 'Dúvidas' },
]

/* ---------------------------------------------------------------- página */

export function LandingPage({ fontClassName }: { fontClassName?: string }) {
  return (
    <div className={cn('landing min-h-dvh overflow-x-clip', fontClassName)}>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-[#1b1c45]"
      >
        Pular para o conteúdo
      </a>

      {/* ------------------------------------------------ cabeçalho + hero */}
      <div className="landing-sky relative text-white">
        <header className="relative z-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link href={ROUTES.HOME} className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <BrandMark className="size-9" tone="gold" />
              <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
            </Link>
            <nav aria-label="Seções da página" className="hidden items-center gap-6 text-sm text-white/80 md:flex">
              {NAV.map((item) => (
                <a key={item.href} href={item.href} className="hover:text-white">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link href={LOGIN} className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white">
                Entrar
              </Link>
              <Link
                href={SIGNUP}
                className="hidden rounded-lg bg-sg-gold px-3.5 py-2 text-sm font-semibold text-[#1b1c45] hover:bg-[#ecc677] sm:inline-flex"
              >
                Criar conta da casa
              </Link>
            </div>
          </div>
        </header>

        <main id="conteudo" className="relative z-10">
          <section aria-labelledby="hero-title" className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-8 pb-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-14 lg:pb-28">
            <div>
              <Eyebrow className="text-[#e8c27a]">Gestão para terreiros e casas de axé</Eyebrow>
              <h1 id="hero-title" className="font-display mt-4 text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Menos tempo com planilha, <em className="font-medium text-[#f4ebda]">mais tempo com o sagrado.</em>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-pretty text-white/80">
                Mensalidades, extrato, cantina, agenda, presença, rifas e o site da casa num lugar só. Cada pessoa vê no
                celular o que tem em aberto e paga no PIX da casa.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={SIGNUP} className={btnGold}>
                  Criar conta da casa <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link href={LOGIN} className={btnGhostDark}>
                  Já tenho conta: entrar
                </Link>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
                {['Plano gratuito para começar', 'Sem cartão no cadastro', 'Para todas as tradições'].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check className="size-4 text-[#8db86a]" aria-hidden="true" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <LeafSprig className="pointer-events-none absolute -bottom-10 -left-4 hidden h-40 w-auto opacity-90 lg:block" />
              <PhoneMockup />
            </div>
          </section>
        </main>
        <div className="landing-pano h-4 w-full" aria-hidden="true" />
      </div>

      {/* ------------------------------------------------ dor x solução */}
      <section aria-labelledby="dor-title" className="px-4 py-20 sm:px-6 sm:py-24">
        <SectionTitle
          id="dor-title"
          eyebrow="Antes e agora"
          title="A casa cresce. O caderno não dá conta."
          intro="Quem cuida da administração costuma fazer tudo à noite, depois do evento. Dá para devolver esse tempo."
        />
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2">
          {PAINS.map(({ before, after, icon: Icon }) => (
            <div key={before} className="rounded-2xl border border-sg-line bg-sg-card p-5 sm:p-6">
              <Icon className="size-5 text-sg-primary" aria-hidden="true" />
              <p className="mt-3 text-sm text-sg-muted">
                <span className="font-semibold text-sg-fg">Antes: </span>
                {before}
              </p>
              <p className="mt-2 text-sm">
                <span className="font-semibold text-sg-leaf">Agora: </span>
                {after}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ funcionalidades */}
      <section id="funcionalidades" aria-labelledby="func-title" className="scroll-mt-4 bg-sg-alt px-4 py-20 sm:px-6 sm:py-24">
        <SectionTitle
          id="func-title"
          eyebrow="Funcionalidades"
          title="Tudo que a casa precisa em um só lugar"
          intro="Do dinheiro à agenda, cada parte da administração tem o seu espaço, e cada pessoa vê só o que lhe cabe."
        />
        <div className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_GROUPS.map(({ title, icon: Icon, items }) => (
            <div key={title} className="flex flex-col rounded-2xl border border-sg-line bg-sg-card p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-sg-primary/10 text-sg-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-sg-muted">
                {items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-sg-leaf" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ site da casa */}
      <section id="site-da-casa" aria-labelledby="site-title" className="scroll-mt-4 px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Site da casa</Eyebrow>
            <h2 id="site-title" className="font-display mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              A sua casa com endereço na internet
            </h2>
            <p className="mt-4 text-base text-pretty text-sg-muted sm:text-lg">
              Ative o site e divulgue a casa sem depender de ninguém. Ele usa os dados que você já cadastrou, então a agenda,
              a cantina e as rifas estão sempre em dia.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                { icon: Sparkles, text: 'Três modelos para escolher, com as cores e o logo da casa' },
                { icon: CalendarCheck, text: 'Sobre a casa, próximos eventos, redes sociais e WhatsApp' },
                { icon: ShoppingBasket, text: 'Cantina e loja com pedido: a casa vê o pedido e prepara' },
                { icon: Ticket, text: 'Rifas e listas abertas para quem é de fora participar' },
                { icon: ShieldCheck, text: 'Opcional: liga e desliga quando a casa quiser' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-sg-primary" aria-hidden="true" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <SiteMockup />
        </div>
      </section>

      {/* ------------------------------------------------ 3 passos (terra) */}
      <section aria-labelledby="passos-title" className="landing-terra px-4 py-20 text-[#f7f1e4] sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs font-bold tracking-[0.18em] text-[#f4ebda] uppercase">Ative sua casa online</p>
          <h2 id="passos-title" className="font-display mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Em 3 passos, a casa está no ar
          </h2>
        </div>
        <ol className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
          {STEPS.map(({ title, text, icon: Icon }, i) => (
            <li key={title} className="rounded-2xl bg-[#17183f] p-6 text-white shadow-lg shadow-black/20">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-sg-gold font-mono text-sm font-bold text-[#1b1c45]">
                  {i + 1}
                </span>
                <Icon className="size-5 text-[#e8c27a]" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-white/80">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-[#f4ebda]">
          Depois, se quiser, ligue o site da casa e divulgue a agenda, a cantina e as rifas.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href={SIGNUP} className={cn(btnBase, 'h-12 bg-[#f4ebda] text-[#6e3320] hover:bg-white focus-visible:ring-white/60 focus-visible:ring-offset-[#94452a]')}>
            Criar conta da casa <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------ tempo */}
      <section aria-labelledby="tempo-title" className="px-4 py-20 sm:px-6 sm:py-24">
        <SectionTitle
          id="tempo-title"
          eyebrow="Tempo de volta"
          title="Um mês na casa, com menos noite no caderno"
          intro="Um exemplo ilustrativo de como a rotina da administração muda. Cada casa tem o seu ritmo."
        />
        <ol className="relative mx-auto mt-12 max-w-3xl space-y-4 border-l-2 border-sg-line pl-6 sm:pl-8">
          {MONTH.map(({ when, text }) => (
            <li key={when} className="relative">
              <span className="absolute top-1.5 -left-[33px] flex size-4 items-center justify-center rounded-full border-2 border-sg-bg bg-sg-gold sm:-left-[41px]" aria-hidden="true" />
              <p className="flex items-center gap-1.5 text-sm font-semibold text-sg-gold-text">
                <Clock className="size-3.5" aria-hidden="true" /> {when}
              </p>
              <p className="mt-1 text-base">{text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex justify-center">
          <BeadLine count={18} />
        </div>
      </section>

      {/* ------------------------------------------------ privacidade */}
      <section aria-labelledby="priv-title" className="bg-sg-alt px-4 py-20 sm:px-6 sm:py-24">
        <SectionTitle
          id="priv-title"
          eyebrow="Privacidade"
          title="Os dados da casa são da casa"
          intro="Confiança é a base de qualquer comunidade. Por isso o Sagrada Gestão foi feito para separar, restringir e registrar."
        />
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2">
          {PRIVACY.map(({ title, text, icon: Icon }) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-sg-line bg-sg-card p-6">
              <Icon className="mt-0.5 size-5 shrink-0 text-sg-primary" aria-hidden="true" />
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-sg-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ planos */}
      <section id="planos" aria-labelledby="planos-title" className="scroll-mt-4 px-4 py-20 sm:px-6 sm:py-24">
        <SectionTitle
          id="planos-title"
          eyebrow="Planos"
          title="Um preço que cabe no caixa da casa"
          intro="Comece grátis. Quando a casa precisar de mais, mude de plano. No anual, dois meses saem de presente."
        />
        <div className="mx-auto mt-12 grid max-w-6xl gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const free = plan.monthlyCents === 0
            const monthsFree = yearlyMonthsFree(plan)
            return (
              <div
                key={plan.id}
                className={cn(
                  'relative flex flex-col rounded-2xl border bg-sg-card p-6 sm:p-7',
                  plan.highlighted ? 'border-sg-primary shadow-xl shadow-sg-primary/15 ring-1 ring-sg-primary' : 'border-sg-line',
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-6 rounded-full bg-sg-gold px-3 py-1 text-xs font-semibold text-[#1b1c45]">
                    Recomendado
                  </span>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-sg-muted">{plan.tagline}</p>
                <div className="mt-5">
                  {free ? (
                    <p className="text-4xl font-bold tracking-tight">Grátis</p>
                  ) : (
                    <p>
                      <span className="text-4xl font-bold tracking-tight tabular-nums">{formatBRL(plan.monthlyCents)}</span>
                      <span className="text-sm text-sg-muted"> /mês</span>
                    </p>
                  )}
                  <p className="mt-1 min-h-10 text-sm text-sg-muted">
                    {free ? (
                      'Para sempre, sem cartão.'
                    ) : (
                      <>
                        ou {formatBRL(plan.yearlyCents)} no ano ({formatBRL(yearlyAsMonthlyCents(plan))}/mês)
                        {monthsFree > 0 && <span className="font-medium text-sg-leaf"> · {monthsFree} meses grátis</span>}
                      </>
                    )}
                  </p>
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm font-medium">
                  <Users className="size-4 text-sg-primary" aria-hidden="true" />
                  {plan.memberLimit ? `Até ${plan.memberLimit} pessoas na casa` : 'Pessoas sem limite'}
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-sg-leaf" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={SIGNUP}
                  className={cn(
                    'mt-6 w-full',
                    plan.highlighted
                      ? btnPrimary
                      : cn(btnBase, 'h-12 border border-sg-line hover:bg-sg-alt focus-visible:ring-sg-primary/40 focus-visible:ring-offset-sg-bg'),
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            )
          })}
        </div>

        {/* comparação discreta */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-dashed border-sg-line p-6 sm:p-8">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Gift className="size-5 text-sg-gold-text" aria-hidden="true" /> Por que é mais em conta
          </h3>
          <p className="mt-2 text-sm text-sg-muted">{MARKET_REFERENCE_TEXT} Aqui o caminho é outro:</p>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {[
              'Plano gratuito de verdade para casas pequenas',
              'Plano principal bem abaixo dessa faixa',
              'Anual com dois meses de presente',
              'Site da casa incluído, sem custo extra',
              'Sem taxa sobre o que a casa recebe',
              'Sem fidelidade: cancele quando quiser',
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-sg-leaf" aria-hidden="true" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------ FAQ */}
      <section id="duvidas" aria-labelledby="faq-title" className="scroll-mt-4 bg-sg-alt px-4 py-20 sm:px-6 sm:py-24">
        <SectionTitle id="faq-title" eyebrow="Dúvidas" title="Perguntas frequentes" />
        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group rounded-xl border border-sg-line bg-sg-card px-5 py-4 open:pb-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <span aria-hidden="true" className="text-xl leading-none text-sg-primary transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-sg-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ CTA final */}
      <section aria-labelledby="cta-title" className="landing-sky relative overflow-hidden px-4 py-20 text-center text-white sm:px-6 sm:py-24">
        <LeafSprig className="pointer-events-none absolute -right-6 bottom-0 h-44 w-auto opacity-80 sm:right-10" />
        <div className="relative mx-auto max-w-2xl">
          <BellRing className="mx-auto size-7 text-[#e8c27a]" aria-hidden="true" />
          <h2 id="cta-title" className="font-display mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Deixe a planilha com a gente. O sagrado fica com a casa.
          </h2>
          <p className="mt-4 text-white/80">Crie a conta da casa agora e convide quem é da casa ainda hoje.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={SIGNUP} className={btnGold}>
              Criar conta da casa <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={LOGIN} className={btnGhostDark}>
              Entrar
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ rodapé */}
      <footer className="border-t border-sg-line px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark className="size-8" />
            <div>
              <p className="text-sm font-semibold">{APP_NAME}</p>
              <p className="text-xs text-sg-muted">Gestão para terreiros e casas de axé</p>
            </div>
          </div>
          <nav aria-label="Rodapé" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-sg-muted">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-sg-fg">
                {item.label}
              </a>
            ))}
            <Link href={LOGIN} className="hover:text-sg-fg">
              Entrar
            </Link>
            <Link href={SIGNUP} className="hover:text-sg-fg">
              Criar conta da casa
            </Link>
          </nav>
        </div>
        <p className="mx-auto mt-8 max-w-6xl text-xs text-sg-muted">
          © {new Date().getFullYear()} {APP_NAME}. Uma ferramenta de administração: cada casa conduz o sagrado do seu jeito.
        </p>
      </footer>
    </div>
  )
}
