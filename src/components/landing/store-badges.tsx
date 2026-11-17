import Image from 'next/image'

import { APP_STORE_URL, PLAY_STORE_URL } from '@/constants/stores'
import { cn } from '@/lib/utils'

/*
  Selos oficiais em PT-BR, sem alteração da arte (só a altura, com a proporção
  original). Apple: 119,66 x 40. Google Play (já sem a margem transparente):
  646 x 192. Altura mínima na tela da Apple: 40px; aqui usamos 44px.
*/
const BADGES = [
  {
    id: 'app-store',
    href: APP_STORE_URL,
    src: '/badges/app-store-pt-br.svg',
    alt: 'Baixar na App Store',
    width: 132,
    height: 44,
  },
  {
    id: 'google-play',
    href: PLAY_STORE_URL,
    src: '/badges/google-play-pt-br.png',
    alt: 'Disponível no Google Play',
    width: 148,
    height: 44,
  },
] as const

export function StoreBadges({ className, align = 'start' }: { className?: string; align?: 'start' | 'center' }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-3', align === 'center' ? 'justify-center' : 'justify-center sm:justify-start', className)}>
      {BADGES.map((b) => {
        const img = (
          <Image
            src={b.src}
            alt={b.href ? b.alt : `${b.alt} (em breve)`}
            width={b.width}
            height={b.height}
            unoptimized={b.src.endsWith('.svg')}
            className="block h-11 w-auto"
          />
        )
        return (
          <li key={b.id} className="flex flex-col items-center gap-1.5">
            {b.href ? (
              <a
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[10px] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e1b75c]"
              >
                {img}
              </a>
            ) : (
              <>
                {img}
                <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-current uppercase opacity-70" aria-hidden="true">
                  Em breve
                </span>
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}
