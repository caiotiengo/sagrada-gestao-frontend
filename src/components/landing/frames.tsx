import { getImageProps } from 'next/image'
import { Lock } from 'lucide-react'

import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------
   Molduras das capturas reais do sistema (public/media/).
   Feitas em CSS: nenhuma arte da Apple nem de navegador de terceiros.
------------------------------------------------------------------- */

/** Capturas do web: 1440x900 em 2x. */
export const SHOT_WIDTH = 2880
export const SHOT_HEIGHT = 1800

/**
 * Captura com versão clara e escura. A landing segue o tema do sistema
 * (prefers-color-scheme), então a troca é feita pelo <picture>: o navegador
 * baixa só a versão do tema em uso.
 */
export function ThemedShot({
  light,
  dark,
  alt,
  sizes,
  eager = false,
  className,
}: {
  light: string
  dark?: string
  alt: string
  sizes: string
  eager?: boolean
  className?: string
}) {
  const common = {
    alt,
    width: SHOT_WIDTH,
    height: SHOT_HEIGHT,
    sizes,
    ...(eager ? { loading: 'eager' as const, fetchPriority: 'high' as const } : {}),
  }
  const { props: lightProps } = getImageProps({ ...common, src: light })
  const darkSrcSet = dark ? getImageProps({ ...common, src: dark }).props.srcSet : undefined

  return (
    <picture className="contents">
      {darkSrcSet && <source media="(prefers-color-scheme: dark)" srcSet={darkSrcSet} sizes={sizes} />}
      {/* eslint-disable-next-line jsx-a11y/alt-text -- o alt vem em lightProps */}
      <img {...lightProps} className={cn('block h-auto w-full', className)} />
    </picture>
  )
}

/** Janela de navegador: três bolinhas e a barra de endereço. */
export function BrowserFrame({
  url,
  children,
  className,
}: {
  url: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'landing-browser overflow-hidden rounded-xl shadow-2xl shadow-[#0e0f2a]/30 sm:rounded-2xl',
        className,
      )}
    >
      <div className="landing-browser-bar flex items-center gap-3 border-b px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-[#ff5f57] sm:size-2.5" />
          <span className="size-2 rounded-full bg-[#febc2e] sm:size-2.5" />
          <span className="size-2 rounded-full bg-[#28c840] sm:size-2.5" />
        </div>
        <div className="landing-browser-url mx-auto flex min-w-0 max-w-sm flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] sm:py-1 sm:text-xs">
          <Lock className="size-2.5 shrink-0 opacity-60 sm:size-3" aria-hidden="true" />
          <span className="truncate">{url}</span>
        </div>
        <span className="hidden w-[46px] shrink-0 sm:block" aria-hidden="true" />
      </div>
      {children}
    </div>
  )
}

/**
 * Corpo de celular moderno (genérico): cantos arredondados, ilha no topo e
 * botões laterais. Medidas em cqw para escalar com a largura.
 */
export function PhoneFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('@container relative', className)}>
      {/* botões laterais */}
      <span aria-hidden="true" className="absolute top-[22%] -left-[1.2cqw] h-[6%] w-[1.6cqw] rounded-l-sm bg-[#2b2c4f]" />
      <span aria-hidden="true" className="absolute top-[30%] -left-[1.2cqw] h-[10%] w-[1.6cqw] rounded-l-sm bg-[#2b2c4f]" />
      <span aria-hidden="true" className="absolute top-[42%] -left-[1.2cqw] h-[10%] w-[1.6cqw] rounded-l-sm bg-[#2b2c4f]" />
      <span aria-hidden="true" className="absolute top-[32%] -right-[1.2cqw] h-[15%] w-[1.6cqw] rounded-r-sm bg-[#2b2c4f]" />
      <div className="relative rounded-[17cqw] bg-gradient-to-b from-[#3a3b66] via-[#1d1e40] to-[#2b2c55] p-[1.4cqw] shadow-[0_30px_80px_-20px_rgb(8_9_30/0.7)] ring-1 ring-white/15">
        <div className="rounded-[15.8cqw] bg-black p-[2.6cqw]">
          <div className="relative aspect-[1206/2622] overflow-hidden rounded-[13.4cqw] bg-[#fbf7ef]">
            {children}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-[2.6cqw] left-1/2 h-[8.6cqw] w-[30cqw] -translate-x-1/2 rounded-full bg-black"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
