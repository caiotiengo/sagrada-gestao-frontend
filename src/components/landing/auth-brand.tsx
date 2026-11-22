import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Peças visuais das telas de entrada (login, cadastro, esqueci a senha), no
 * visual da landing. O fundo e os tokens vêm de src/app/(auth)/layout.tsx.
 */

/** Botão dourado principal, o mesmo "Testar 14 dias grátis" da landing. */
export const authBtnGold =
  'h-11 rounded-full bg-sg-gold font-semibold text-[#1b1c45] shadow-[0_8px_30px_-8px_rgb(225_183_92/0.7)] hover:bg-[#ecc677] focus-visible:ring-[#e1b75c]/50 [a]:hover:bg-[#ecc677]'
/** Botão secundário (contorno) dentro do cartão claro. */
export const authBtnOutline = 'h-11 rounded-full border-sg-line bg-transparent font-semibold text-sg-fg hover:bg-sg-alt'
/** Link de destaque dentro do cartão claro. */
export const authLink = 'font-semibold text-sg-gold-text underline-offset-4 hover:underline'

/** Cartão claro do formulário sobre o céu. */
export function AuthCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('auth-card rounded-3xl p-6 sm:p-8', className)}>{children}</div>
}

/** Título serifado com a palavra em dourado itálico (como o hero da landing). */
export function AuthHeadline({
  word,
  visible,
  className,
}: {
  word: string
  visible: boolean
  className?: string
}) {
  return (
    <h1 className={cn('font-display leading-[1.08] font-medium text-balance', className)}>
      Tudo que{' '}
      <span
        className="landing-gold-text inline-block italic transition-all duration-300 ease-in-out"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(6px)' }}
      >
        {word}
      </span>{' '}
      precisa em um só lugar.
    </h1>
  )
}

/** Painel de apresentação do desktop (lado esquerdo do login e do cadastro). */
export function AuthPromoPanel({
  word,
  visible,
  features,
}: {
  word: string
  visible: boolean
  features: { icon: LucideIcon; title: string; description: string }[]
}) {
  return (
    <div className="relative hidden w-1/2 lg:flex lg:flex-col lg:justify-between">
      <div className="flex flex-1 flex-col justify-center px-12 xl:px-16">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-[#f4ebda] backdrop-blur">
          <span className="size-1.5 rounded-full bg-sg-gold" aria-hidden="true" />
          Gestão para terreiros e casas de axé
        </p>
        <AuthHeadline word={word} visible={visible} className="mt-6 text-5xl xl:text-6xl" />
        <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">
          O sistema completo para gestão de casas de santo. Organize membros, finanças, eventos e muito mais.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="landing-card-night rounded-2xl p-4">
              <feature.icon className="mb-2 size-5 text-sg-gold" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-white/65">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-12 pb-8 xl:px-16">
        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} Saravá Tech. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
