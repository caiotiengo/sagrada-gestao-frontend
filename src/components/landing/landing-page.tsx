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
  ListChecks,
  Lock,
  Megaphone,
  NotebookPen,
  Palette,
  Receipt,
  Share2,
  ShoppingBasket,
  Smartphone,
  Store,
  Ticket,
  ToggleRight,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import { APP_NAME, ROUTES, appUrl } from '@/constants'
import {
  MARKET_REFERENCE_TEXT,
  PLANS,
  formatBRL,
  yearlyAsMonthlyCents,
  yearlyMonthsFree,
} from '@/constants/plans'
import { cn } from '@/lib/utils'

import { AppTourVideo } from './app-tour-video'
import { BeadLine, BrandMark, LeafSprig } from './brand'
import { BrowserFrame, PhoneFrame, ThemedShot } from './frames'
import { RevealOnScroll } from './reveal'
import { StoreBadges } from './store-badges'

// A landing roda no domínio raiz; entrar e criar conta acontecem no app (app.<domínio>)
const LOGIN = appUrl(ROUTES.LOGIN)
const SIGNUP = appUrl(ROUTES.REGISTER_ADMIN)

/** Endereço mostrado na moldura do site público (cada casa escolhe o seu). */
const SITE_HOST_EXAMPLE = 'casadeaxeexemplo.sagradagestao.com.br'
const APP_HOST = 'app.sagradagestao.com.br'

const MEDIA = {
  // O sistema web só tem tema claro, então as capturas também.
  adminLight: '/media/web-admin-light.webp',
  memberLight: '/media/web-member-light.webp',
  site: '/media/site-casa.webp',
}

const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2'
const btnGold = cn(
  btnBase,
  'h-12 bg-sg-gold text-[#1b1c45] shadow-[0_8px_30px_-8px_rgb(225_183_92/0.7)] hover:-translate-y-0.5 hover:bg-[#ecc677] focus-visible:ring-[#e1b75c]/60 focus-visible:ring-offset-[#121335]',
)
const btnPrimary = cn(btnBase, 'h-12 bg-sg-primary text-sg-primary-fg hover:opacity-90 focus-visible:ring-sg-primary/40 focus-visible:ring-offset-sg-bg')
const btnGhostDark = cn(
  btnBase,
  'h-12 border border-white/20 bg-white/5 text-white backdrop-blur hover:bg-white/10 focus-visible:ring-white/40 focus-visible:ring-offset-[#121335]',
)
const btnOutline = cn(btnBase, 'h-12 border border-sg-line bg-sg-card/60 hover:bg-sg-alt focus-visible:ring-sg-primary/40 focus-visible:ring-offset-sg-bg')

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-xs font-bold tracking-[0.18em] text-sg-gold-text uppercase', className)}>{children}</p>
  )
}

function SectionTitle({
  id,
  eyebrow,
  title,
  intro,
  className,
}: {
  id: string
  eyebrow: string
  title: React.ReactNode
  intro?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('l-reveal mx-auto max-w-3xl text-center', className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="font-display mt-4 text-4xl leading-[1.08] font-medium text-balance sm:text-5xl">
        {title}
      </h2>
      {intro && <p className="mx-auto mt-5 max-w-2xl text-base text-pretty text-sg-muted sm:text-lg">{intro}</p>}
    </div>
  )
}

function CheckItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <li className={cn('flex gap-2', className)}>
      <Check className="mt-0.5 size-4 shrink-0 text-sg-leaf" aria-hidden="true" />
      <span>{children}</span>
    </li>
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

type Tile = {
  title: string
  text: string
  icon: LucideIcon
  className?: string
  items?: string[]
  visual?: 'orders' | 'agenda' | 'raffle'
}

/** Ilustrações decorativas dos cartões (só no desktop, para dar ritmo ao bento). */
function TileVisual({ kind }: { kind: NonNullable<Tile['visual']> }) {
  if (kind === 'orders') {
    return (
      <div className="mt-auto hidden gap-2 pt-6 lg:flex" aria-hidden="true">
        {[
          ['Pendente', 'bg-sg-gold/20 text-sg-gold-text'],
          ['Pronto', 'bg-sg-primary/12 text-sg-primary'],
          ['Pago', 'bg-sg-leaf/15 text-sg-leaf'],
        ].map(([label, tone]) => (
          <span key={label} className={cn('rounded-full px-3 py-1 text-xs font-semibold', tone)}>
            {label}
          </span>
        ))}
      </div>
    )
  }
  if (kind === 'raffle') {
    const taken = new Set([2, 3, 7, 9, 10, 14])
    return (
      <div className="mt-auto hidden grid-cols-5 gap-1.5 pt-6 lg:grid" aria-hidden="true">
        {Array.from({ length: 15 }, (_, i) => (
          <span
            key={i}
            className={cn(
              'flex h-7 items-center justify-center rounded-md font-mono text-[11px] font-semibold',
              taken.has(i) ? 'bg-sg-primary text-sg-primary-fg' : 'border border-sg-line text-sg-muted',
            )}
          >
            {String(i + 1).padStart(2, '0')}
          </span>
        ))}
      </div>
    )
  }
  return (
    <div className="mt-auto hidden items-center gap-3 pt-6 lg:flex" aria-hidden="true">
      <span className="flex size-12 flex-col items-center justify-center rounded-xl bg-sg-primary text-sg-primary-fg">
        <span className="text-[9px] font-semibold uppercase">sáb</span>
        <span className="text-lg leading-none font-bold">23</span>
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-sg-leaf/15 px-3 py-1 text-xs font-semibold text-sg-leaf">
        <Check className="size-3.5" /> Presença confirmada
      </span>
    </div>
  )
}

const TILES: Tile[] = [
  {
    title: 'Cantina e loja',
    icon: Store,
    text: 'Itens com preço e estoque que baixa a cada venda. Venda no balcão no dinheiro, no PIX ou no fiado.',
    items: ['Fila de pedidos: pendente, pronto, pago', 'Pedidos também pelo site da casa'],
    className: 'lg:col-span-2',
    visual: 'orders',
  },
  {
    title: 'Agenda e presença',
    icon: CalendarCheck,
    text: 'Agenda da casa com confirmação de presença. No app, check-in na porta por busca ou QR.',
    visual: 'agenda',
  },
  {
    title: 'Rifas',
    icon: Ticket,
    text: 'Números reservados por pessoa e sorteio que guarda a semente para quem quiser conferir.',
    visual: 'raffle',
  },
  {
    title: 'Listas e campanhas',
    icon: ListChecks,
    text: 'Inscrição para os trabalhos da casa e campanhas com cotas por pessoa.',
  },
  {
    title: 'Avisos e notificações',
    icon: BellRing,
    text: 'Mural de avisos da casa e notificação no celular de quem é da casa.',
  },
  {
    title: 'Permissões por função',
    icon: KeyRound,
    text: 'Tesouraria, cantina, agenda, rifas: cada pessoa acessa só o que a casa liberou para ela. Convite por link para entrar.',
    className: 'lg:col-span-2',
  },
  {
    title: 'No celular e no computador',
    icon: Smartphone,
    text: 'Funciona no navegador desde já. O app para iPhone e Android está a caminho das lojas, com check-in por QR, balcão e o seu QR de presença.',
    className: 'lg:col-span-2',
  },
]

const SITE_POINTS: { icon: LucideIcon; text: string }[] = [
  { icon: Globe, text: 'Endereço próprio, como suacasa.sagradagestao.com.br' },
  { icon: Palette, text: 'Três modelos (clássico, moderno e minimalista) com as cores, o logo e a foto de capa da casa' },
  { icon: CalendarCheck, text: 'Sobre a casa e os próximos eventos, puxados da agenda que vocês já usam' },
  { icon: Share2, text: 'Endereço, telefones, WhatsApp, Instagram, Facebook e YouTube da casa' },
  { icon: ToggleRight, text: 'Liga e desliga quando a casa quiser' },
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
    q: 'O site da casa é pago?',
    a: 'Não à parte: o site da casa está incluso em todos os planos e no teste grátis. É opcional: liga e desliga quando a casa quiser. Ele também recebe pedidos da cantina e mostra as rifas e listas abertas.',
  },
  {
    q: 'Minha casa é pequena. Vale a pena?',
    a: 'Vale. Teste 14 dias grátis, sem cartão e com tudo liberado. Depois, o plano Casa sai por R$ 34,90/mês (ou R$ 349 no ano) para até 100 pessoas, com o site da casa incluso.',
  },
  {
    q: 'Como a casa paga a assinatura?',
    a: 'Com PIX, boleto ou cartão, pela página Plano e cobrança. No cartão a cobrança é automática; no PIX e no boleto a casa paga cada período. Se um pagamento atrasar, a casa tem 15 dias para regularizar sem perder nada.',
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
      <RevealOnScroll />
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-[#1b1c45]"
      >
        Pular para o conteúdo
      </a>

      {/* ------------------------------------------------ cabeçalho */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#121335]/85 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <BrandMark className="size-9" tone="gold" />
            <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
          </Link>
          <nav aria-label="Seções da página" className="hidden items-center gap-7 text-sm text-white/75 md:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href={LOGIN} className="rounded-full px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white">
              Entrar
            </Link>
            <Link
              href={SIGNUP}
              className="hidden rounded-full bg-sg-gold px-4 py-2 text-sm font-semibold text-[#1b1c45] transition hover:bg-[#ecc677] sm:inline-flex"
            >
              Criar conta da casa
            </Link>
          </div>
        </div>
      </header>

      <main id="conteudo">
        {/* ------------------------------------------------ hero */}
        <section aria-labelledby="hero-title" className="landing-sky relative isolate overflow-hidden text-white">
          <div className="landing-glow pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
          <div className="mx-auto max-w-6xl px-4 pt-28 sm:px-6 sm:pt-36">
            <div className="mx-auto max-w-4xl text-center">
              <p
                className="l-rise mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-[#f4ebda] backdrop-blur"
                style={{ '--d': '0ms' } as React.CSSProperties}
              >
                <span className="size-1.5 rounded-full bg-sg-gold" aria-hidden="true" />
                Gestão para terreiros e casas de axé
              </p>
              <h1
                id="hero-title"
                className="l-rise font-display mt-6 text-[2.6rem] leading-[1.04] font-medium text-balance sm:text-6xl lg:text-7xl"
                style={{ '--d': '80ms' } as React.CSSProperties}
              >
                Menos tempo com planilha, <span className="landing-gold-text italic">mais tempo com o sagrado.</span>
              </h1>
              <p
                className="l-rise mx-auto mt-6 max-w-2xl text-lg text-pretty text-white/75 sm:text-xl"
                style={{ '--d': '160ms' } as React.CSSProperties}
              >
                Mensalidades, extrato, cantina, agenda, presença, rifas e o site da casa num lugar só. Cada pessoa vê no
                celular o que tem em aberto e paga no PIX da casa.
              </p>
              <div className="l-rise mt-9 flex flex-col justify-center gap-3 sm:flex-row" style={{ '--d': '240ms' } as React.CSSProperties}>
                <Link href={SIGNUP} className={btnGold}>
                  Testar 14 dias grátis <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link href={LOGIN} className={btnGhostDark}>
                  Já tenho conta: entrar
                </Link>
              </div>
              <div className="l-rise mt-8" style={{ '--d': '320ms' } as React.CSSProperties}>
                <StoreBadges align="center" className="text-white" />
              </div>
              <ul
                className="l-rise mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70"
                style={{ '--d': '380ms' } as React.CSSProperties}
              >
                {['14 dias grátis, sem cartão', 'A partir de R$ 34,90/mês', 'Pague com PIX, boleto ou cartão', 'Site da casa incluso'].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check className="size-4 text-[#8db86a]" aria-hidden="true" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* composição: navegador com a gestão + celular com o app */}
            <div className="l-rise relative mx-auto mt-14 max-w-5xl pb-16 sm:mt-16 sm:pb-24" style={{ '--d': '460ms' } as React.CSSProperties}>
              <div className="landing-horizon pointer-events-none absolute inset-x-[-10%] bottom-0 h-2/3" aria-hidden="true" />
              <LeafSprig className="pointer-events-none absolute -bottom-2 -left-10 hidden h-48 w-auto opacity-80 lg:block" />
              <figure className="relative mr-[22%] sm:mr-[16%] lg:mr-[12%]">
                <BrowserFrame url={`${APP_HOST}/admin`}>
                  <ThemedShot
                    light={MEDIA.adminLight}
                    alt="Painel da gestão no computador, com dados de uma casa de exemplo: saldo do caixa, pendências da casa, receita por origem e ações rápidas."
                    sizes="(min-width: 1024px) 880px, 80vw"
                    eager
                  />
                </BrowserFrame>
              </figure>
              <figure className="absolute right-0 bottom-6 w-[34%] sm:bottom-10 sm:w-[25%] lg:w-[23%]">
                <PhoneFrame>
                  <AppTourVideo eager />
                </PhoneFrame>
              </figure>
            </div>
          </div>
          <div className="landing-pano h-3 w-full" aria-hidden="true" />
        </section>

        {/* ------------------------------------------------ dor x solução */}
        <section aria-labelledby="dor-title" className="relative px-4 py-24 sm:px-6 sm:py-32">
          <SectionTitle
            id="dor-title"
            eyebrow="Antes e agora"
            title="A casa cresce. O caderno não dá conta."
            intro="Quem cuida da administração costuma fazer tudo à noite, depois do evento. Dá para devolver esse tempo."
          />
          <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-2">
            {PAINS.map(({ before, after, icon: Icon }, i) => (
              <div
                key={before}
                className="l-reveal landing-card rounded-3xl p-6 sm:p-7"
                style={{ '--d': `${(i % 2) * 90}ms` } as React.CSSProperties}
              >
                <span className="flex size-10 items-center justify-center rounded-2xl bg-sg-primary/10 text-sg-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-5 text-sm text-sg-muted line-through decoration-sg-muted/40">{before}</p>
                <p className="mt-2 text-base font-medium">
                  <ArrowRight className="mr-1.5 inline size-4 text-sg-leaf" aria-hidden="true" />
                  <span className="sr-only">Agora: </span>
                  {after}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------ funcionalidades (bento) */}
        <section id="funcionalidades" aria-labelledby="func-title" className="relative scroll-mt-16 overflow-hidden bg-sg-alt px-4 py-24 sm:px-6 sm:py-32">
          <div className="landing-dots pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <SectionTitle
              id="func-title"
              eyebrow="Funcionalidades"
              title={
                <>
                  Tudo que a casa precisa <span className="landing-ink-text">em um só lugar</span>
                </>
              }
              intro="Do dinheiro à agenda, cada parte da administração tem o seu espaço, e cada pessoa vê só o que lhe cabe."
            />
            <div className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* destaque: financeiro com a tela real do membro */}
              <article className="l-reveal landing-ring relative flex flex-col overflow-hidden rounded-3xl sm:col-span-2 lg:row-span-2">
                <div className="p-6 sm:p-8">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-sg-primary text-sg-primary-fg">
                    <Wallet className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-display mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">Mensalidades e extrato sem caderno</h3>
                  <p className="mt-3 text-sg-muted">
                    Mensalidades lançadas em lote, baixa com a forma de pagamento e extrato com entradas e saídas, exportável em
                    planilha.
                  </p>
                  <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                    <CheckItem>Dívidas, fiado e cobranças avulsas</CheckItem>
                    <CheckItem>&quot;O que eu devo&quot; para cada pessoa</CheckItem>
                    <CheckItem>Chave PIX da casa para copiar</CheckItem>
                    <CheckItem>Extrato exportável em planilha</CheckItem>
                  </ul>
                </div>
                <div className="relative mt-auto ml-6 aspect-[16/10] overflow-hidden rounded-tl-2xl border-t border-l border-sg-line shadow-xl sm:ml-8">
                  <ThemedShot
                    className="h-full object-cover object-left-top"
                    light={MEDIA.memberLight}
                    alt="Tela de quem é da casa no computador: o saldo em aberto, separado em mensalidade e loja, e a próxima mensalidade."
                    sizes="(min-width: 1024px) 560px, 90vw"
                  />
                </div>
              </article>

              {TILES.map(({ title, text, icon: Icon, items, visual, className }, i) => (
                <article
                  key={title}
                  className={cn('l-reveal landing-card flex flex-col rounded-3xl p-5 sm:p-6', className)}
                  style={{ '--d': `${(i % 3) * 80}ms` } as React.CSSProperties}
                >
                  <div className="flex items-center gap-3 sm:block">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sg-primary/10 text-sg-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-lg font-semibold sm:mt-4">{title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-pretty text-sg-muted">{text}</p>
                  {items && (
                    <ul className="mt-3 space-y-1.5 text-sm">
                      {items.map((item) => (
                        <CheckItem key={item}>{item}</CheckItem>
                      ))}
                    </ul>
                  )}
                  {visual && <TileVisual kind={visual} />}
                </article>
              ))}

              <a
                href="#site-da-casa"
                className="l-reveal group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#121335] p-6 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sg-primary lg:col-span-2"
              >
                <div className="landing-glow pointer-events-none absolute inset-0 opacity-80" aria-hidden="true" />
                <div className="relative">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sg-gold px-2.5 py-1 text-xs font-bold text-[#1b1c45]">
                    <Gift className="size-3.5" aria-hidden="true" /> Incluso
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">Site da casa</h3>
                  <p className="mt-2 text-sm text-white/75">Endereço próprio, três modelos e a agenda sempre em dia. Em todos os planos.</p>
                </div>
                <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#e8c27a]">
                  Ver o site da casa <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ site da casa (incluso) */}
        <section id="site-da-casa" aria-labelledby="site-title" className="relative scroll-mt-16 overflow-hidden px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="l-reveal">
              <p className="inline-flex items-center gap-2 rounded-full border border-sg-line bg-sg-card px-3 py-1 text-xs font-semibold">
                <Gift className="size-3.5 text-sg-gold-text" aria-hidden="true" /> Incluso em todos os planos
              </p>
              <h2 id="site-title" className="font-display mt-5 text-4xl leading-[1.08] font-medium text-balance sm:text-5xl">
                Seu terreiro na internet, <span className="landing-ink-text">sem custo à parte.</span>
              </h2>
              <p className="mt-5 text-base text-pretty text-sg-muted sm:text-lg">
                Ligue o site e divulgue a casa sem depender de ninguém e sem pagar nada por isso. Ele usa os dados que vocês já
                cadastraram, então a agenda está sempre em dia.
              </p>
              <ul className="mt-7 space-y-3.5 text-sm sm:text-base">
                {SITE_POINTS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sg-primary/10 text-sg-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="pt-0.5">{text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 flex gap-2 text-sm text-sg-muted">
                <Store className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Nos planos pagos, o site também recebe pedidos da cantina e da loja e mostra as rifas e listas abertas.
              </p>
              <div className="mt-8">
                <Link href={SIGNUP} className={btnPrimary}>
                  Criar a conta e ligar o site <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <figure className="l-reveal relative" style={{ '--d': '120ms' } as React.CSSProperties}>
              <div
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-[#e1b75c]/25 via-transparent to-[#3e42b6]/25 blur-2xl"
                aria-hidden="true"
              />
              <BrowserFrame url={SITE_HOST_EXAMPLE}>
                <ThemedShot
                  light={MEDIA.site}
                  alt="Site público de uma casa de exemplo feito no Sagrada Gestão: capa com o nome da casa, menu com listas, rifas e loja."
                  sizes="(min-width: 1024px) 640px, 92vw"
                />
              </BrowserFrame>
              <figcaption className="mt-4 text-center text-xs text-sg-muted">Site de uma casa de exemplo, com dados fictícios.</figcaption>
            </figure>
          </div>
        </section>

        {/* ------------------------------------------------ quem é da casa */}
        <section aria-labelledby="membro-title" className="relative overflow-hidden bg-sg-alt px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <figure className="l-reveal order-2 lg:order-1">
              <BrowserFrame url={`${APP_HOST}/membro`}>
                <ThemedShot
                  light={MEDIA.memberLight}
                  alt="Painel de quem é da casa: o saldo em aberto, a próxima mensalidade, o acesso rápido e o mural de avisos."
                  sizes="(min-width: 1024px) 640px, 92vw"
                />
              </BrowserFrame>
            </figure>
            <div className="l-reveal order-1 lg:order-2">
              <Eyebrow>Para quem é da casa</Eyebrow>
              <h2 id="membro-title" className="font-display mt-4 text-4xl leading-[1.08] font-medium text-balance sm:text-5xl">
                Ninguém precisa perguntar quanto deve
              </h2>
              <p className="mt-5 text-base text-pretty text-sg-muted sm:text-lg">
                Cada pessoa entra com o próprio acesso e vê só o que é seu: o que tem em aberto, a agenda, os avisos e a chave PIX
                da casa para pagar.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm sm:text-base">
                <CheckItem>&quot;O que eu devo&quot; com mensalidades, fiado e cotas</CheckItem>
                <CheckItem>Confirmação de presença nos eventos</CheckItem>
                <CheckItem>Avisos da casa no mural e no celular</CheckItem>
              </ul>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ 3 passos (terra) */}
        <section aria-labelledby="passos-title" className="landing-terra relative px-4 py-24 text-[#f7f1e4] sm:px-6 sm:py-32">
          <div className="l-reveal mx-auto max-w-2xl text-center">
            <p className="font-mono text-xs font-bold tracking-[0.18em] text-[#f4ebda] uppercase">Ative sua casa online</p>
            <h2 id="passos-title" className="font-display mt-4 text-4xl leading-[1.08] font-medium text-balance sm:text-5xl">
              Em 3 passos, a casa está no ar
            </h2>
          </div>
          <ol className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
            {STEPS.map(({ title, text, icon: Icon }, i) => (
              <li
                key={title}
                className="l-reveal rounded-3xl border border-white/10 bg-[#17183f]/90 p-7 text-white shadow-xl shadow-black/25 backdrop-blur"
                style={{ '--d': `${i * 100}ms` } as React.CSSProperties}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-sg-gold font-mono text-sm font-bold text-[#1b1c45]">
                    {i + 1}
                  </span>
                  <Icon className="size-5 text-[#e8c27a]" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-white/80">{text}</p>
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-[#f4ebda]">
            Depois, ligue o site da casa (incluso no plano) e divulgue a agenda.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href={SIGNUP}
              className={cn(btnBase, 'h-12 bg-[#f4ebda] text-[#6e3320] hover:bg-white focus-visible:ring-white/60 focus-visible:ring-offset-[#94452a]')}
            >
              Criar conta da casa <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* ------------------------------------------------ tempo */}
        <section aria-labelledby="tempo-title" className="px-4 py-24 sm:px-6 sm:py-32">
          <SectionTitle
            id="tempo-title"
            eyebrow="Tempo de volta"
            title="Um mês na casa, com menos noite no caderno"
            intro="Um exemplo ilustrativo de como a rotina da administração muda. Cada casa tem o seu ritmo."
          />
          <ol className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {MONTH.map(({ when, text }, i) => (
              <li
                key={when}
                className="l-reveal landing-card relative rounded-3xl p-6"
                style={{ '--d': `${i * 70}ms` } as React.CSSProperties}
              >
                <p className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-sg-gold-text uppercase">
                  <Clock className="size-3.5" aria-hidden="true" /> {when}
                </p>
                <p className="mt-3 text-sm text-pretty">{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 flex justify-center">
            <BeadLine count={18} />
          </div>
        </section>

        {/* ------------------------------------------------ privacidade */}
        <section aria-labelledby="priv-title" className="bg-sg-alt px-4 py-24 sm:px-6 sm:py-32">
          <SectionTitle
            id="priv-title"
            eyebrow="Privacidade"
            title="Os dados da casa são da casa"
            intro="Confiança é a base de qualquer comunidade. Por isso o Sagrada Gestão foi feito para separar, restringir e registrar."
          />
          <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2">
            {PRIVACY.map(({ title, text, icon: Icon }, i) => (
              <div
                key={title}
                className="l-reveal landing-card flex gap-4 rounded-3xl p-6"
                style={{ '--d': `${(i % 2) * 90}ms` } as React.CSSProperties}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sg-primary/10 text-sg-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-sg-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------ planos */}
        <section id="planos" aria-labelledby="planos-title" className="scroll-mt-16 px-4 py-24 sm:px-6 sm:py-32">
          <SectionTitle
            id="planos-title"
            eyebrow="Planos"
            title="Um preço que cabe no caixa da casa"
            intro="Teste 14 dias grátis, sem cartão e com tudo liberado. Depois, a partir de R$ 34,90/mês, com o site da casa incluso. Pague com PIX, boleto ou cartão. No anual, dois meses saem de presente."
          />
          <div className="mx-auto mt-14 grid max-w-4xl items-stretch gap-4 md:grid-cols-2">
            {PLANS.map((plan, i) => {
              const free = plan.monthlyCents === 0
              const monthsFree = yearlyMonthsFree(plan)
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'l-reveal relative flex flex-col rounded-3xl p-7 sm:p-8',
                    plan.highlighted ? 'landing-ring shadow-2xl shadow-sg-primary/20' : 'landing-card',
                  )}
                  style={{ '--d': `${i * 90}ms` } as React.CSSProperties}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-7 rounded-full bg-sg-gold px-3 py-1 text-xs font-semibold text-[#1b1c45]">
                      Recomendado
                    </span>
                  )}
                  <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-sg-muted">{plan.tagline}</p>
                  <div className="mt-6">
                    {free ? (
                      <p className="text-5xl font-bold tracking-tight">Grátis</p>
                    ) : (
                      <p>
                        <span className="text-5xl font-bold tracking-tight tabular-nums">{formatBRL(plan.monthlyCents)}</span>
                        <span className="text-sm text-sg-muted"> /mês</span>
                      </p>
                    )}
                    <p className="mt-2 min-h-10 text-sm text-sg-muted">
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
                  <p className="mt-5 flex items-center gap-2 border-t border-sg-line pt-5 text-sm font-medium">
                    <Users className="size-4 text-sg-primary" aria-hidden="true" />
                    {plan.memberLimit ? `Até ${plan.memberLimit} pessoas na casa` : 'Pessoas sem limite'}
                  </p>
                  <ul className="mt-4 flex-1 space-y-2.5 text-sm">
                    {plan.features.map((f) => (
                      <CheckItem key={f}>{f}</CheckItem>
                    ))}
                  </ul>
                  <Link href={SIGNUP} className={cn('mt-8 w-full', plan.highlighted ? btnPrimary : btnOutline)}>
                    {plan.cta}
                  </Link>
                </div>
              )
            })}
          </div>

          {/* comparação discreta */}
          <div className="l-reveal mx-auto mt-12 max-w-3xl rounded-3xl border border-dashed border-sg-line p-6 sm:p-8">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Gift className="size-5 text-sg-gold-text" aria-hidden="true" /> Por que é mais em conta
            </h3>
            <p className="mt-2 text-sm text-sg-muted">{MARKET_REFERENCE_TEXT} Aqui o caminho é outro:</p>
            <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {[
                '14 dias grátis para testar, sem cartão',
                'Site da casa incluso, em todos os planos',
                'Plano principal bem abaixo dessa faixa',
                'Anual com dois meses de presente',
                'Sem taxa sobre o que a casa recebe',
                'Sem fidelidade: cancele quando quiser',
              ].map((t) => (
                <CheckItem key={t}>{t}</CheckItem>
              ))}
            </ul>
          </div>
        </section>

        {/* ------------------------------------------------ FAQ */}
        <section id="duvidas" aria-labelledby="faq-title" className="scroll-mt-16 bg-sg-alt px-4 py-24 sm:px-6 sm:py-32">
          <SectionTitle id="faq-title" eyebrow="Dúvidas" title="Perguntas frequentes" />
          <div className="mx-auto mt-12 max-w-3xl space-y-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="l-reveal group landing-card rounded-2xl px-5 py-4 open:pb-5 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sg-primary [&::-webkit-details-marker]:hidden">
                  {q}
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sg-primary/10 text-lg leading-none text-sg-primary transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-sg-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------ CTA final */}
        <section aria-labelledby="cta-title" className="landing-sky relative isolate overflow-hidden px-4 py-24 text-center text-white sm:px-6 sm:py-32">
          <div className="landing-glow pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
          <LeafSprig className="pointer-events-none absolute -right-6 bottom-0 -z-10 h-44 w-auto opacity-70 sm:right-10" />
          <div className="l-reveal relative mx-auto max-w-3xl">
            <BrandMark className="mx-auto size-12" tone="gold" />
            <h2 id="cta-title" className="font-display mt-6 text-4xl leading-[1.08] font-medium text-balance sm:text-6xl">
              Deixe a planilha com a gente. <span className="landing-gold-text italic">O sagrado fica com a casa.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">
              Crie a conta da casa agora: 14 dias grátis, sem cartão. Ligue o site e convide quem é da casa ainda hoje.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={SIGNUP} className={btnGold}>
                Testar 14 dias grátis <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href={LOGIN} className={btnGhostDark}>
                Entrar
              </Link>
            </div>
            <StoreBadges align="center" className="mt-9 text-white" />
          </div>
        </section>
      </main>

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
            <Link href={ROUTES.PRIVACY} className="hover:text-sg-fg">
              Privacidade
            </Link>
            <Link href={ROUTES.TERMS} className="hover:text-sg-fg">
              Termos
            </Link>
            <Link href={ROUTES.DELETE_ACCOUNT_INFO} className="hover:text-sg-fg">
              Excluir conta
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
