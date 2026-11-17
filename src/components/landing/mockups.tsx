import { Bell, CalendarDays, Check, Copy, Globe, ShoppingBasket, Ticket } from 'lucide-react'

/* Telas fictícias, só para ilustrar. Nomes e valores inventados. */

export function PhoneMockup() {
  const items = [
    { label: 'Mensalidade de novembro', value: 'R$ 50,00' },
    { label: 'Cantina (fiado)', value: 'R$ 18,00' },
    { label: 'Cota da campanha da reforma', value: 'R$ 12,00' },
  ]
  return (
    <figure className="relative mx-auto w-[260px] sm:w-[280px]">
      <div className="rounded-[2.2rem] border-[6px] border-[#2a2b63] bg-[#17183f] p-3 shadow-2xl shadow-black/50">
        <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-white/15" />
        <div className="rounded-2xl bg-[#fbf7ef] p-4 text-[#1b1c45]">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#525476]">Casa de exemplo</p>
          <p className="mt-1 text-base font-semibold">O que eu devo</p>
          <div className="mt-3 rounded-xl bg-[#3e42b6] p-3 text-white">
            <p className="text-[11px] text-white/80">Total em aberto</p>
            <p className="text-2xl font-bold tracking-tight">R$ 80,00</p>
          </div>
          <ul className="mt-3 space-y-2">
            {items.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-2 border-b border-[#e3d7c1] pb-2 text-[12px] last:border-0">
                <span>{item.label}</span>
                <span className="font-semibold whitespace-nowrap tabular-nums">{item.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-[#e1b75c] py-2 text-[12px] font-semibold text-[#1b1c45]">
            <Copy className="size-3.5" aria-hidden="true" />
            Copiar chave PIX da casa
          </div>
        </div>
      </div>
      <div className="absolute top-8 -left-[150px] hidden w-40 rounded-xl border border-white/10 bg-[#17183f]/95 p-3 text-white shadow-xl sm:block">
        <p className="flex items-center gap-1.5 text-[11px] text-white/75">
          <Bell className="size-3.5 text-[#e1b75c]" aria-hidden="true" /> Aviso da casa
        </p>
        <p className="mt-1 text-[12px] font-medium leading-snug">Evento de sábado confirmado às 19h.</p>
      </div>
      <div className="absolute -right-[150px] bottom-24 hidden w-40 rounded-xl border border-white/10 bg-[#17183f]/95 p-3 text-white shadow-xl sm:block">
        <p className="flex items-center gap-1.5 text-[11px] text-white/75">
          <Check className="size-3.5 text-[#8db86a]" aria-hidden="true" /> Baixa registrada
        </p>
        <p className="mt-1 text-[12px] font-medium leading-snug">Mensalidade paga, já no extrato.</p>
      </div>
      <figcaption className="sr-only">
        Tela ilustrativa do app: a pessoa da casa vê o total em aberto, os itens e copia a chave PIX da casa.
      </figcaption>
    </figure>
  )
}

export function SiteMockup() {
  return (
    <figure className="w-full overflow-hidden rounded-2xl border border-sg-line bg-sg-card shadow-xl shadow-black/10">
      <div className="flex items-center gap-2 border-b border-sg-line bg-sg-alt px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#a4522f]" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-[#c9913c]" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-[#4e8a4a]" aria-hidden="true" />
        <span className="ml-2 flex min-w-0 items-center gap-1.5 truncate rounded-md bg-sg-card px-2.5 py-1 text-xs text-sg-muted">
          <Globe className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">suacasa.sagradagestao.com.br</span>
        </span>
      </div>
      <div className="landing-sky px-5 py-7 text-white">
        <p className="text-[11px] uppercase tracking-widest text-[#e8c27a]">Bem-vindos</p>
        <p className="font-display mt-1 text-2xl font-semibold">Casa de exemplo</p>
        <p className="mt-1 max-w-xs text-sm text-white/80">Sobre a casa, horários e como chegar.</p>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-3">
        {[
          { icon: CalendarDays, title: 'Próximos eventos', text: 'Sábado, 19h' },
          { icon: ShoppingBasket, title: 'Cantina e loja', text: 'Peça e retire na casa' },
          { icon: Ticket, title: 'Rifas e listas', text: 'Participe pelo celular' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border border-sg-line bg-sg-bg p-3">
            <Icon className="size-4 text-sg-primary" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold">{title}</p>
            <p className="text-xs text-sg-muted">{text}</p>
          </div>
        ))}
      </div>
      <figcaption className="sr-only">Exemplo ilustrativo do site público de uma casa.</figcaption>
    </figure>
  )
}
