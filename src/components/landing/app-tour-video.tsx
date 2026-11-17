'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { Pause, Play } from 'lucide-react'

export const APP_TOUR = {
  mp4: '/media/app-tour.mp4',
  webm: '/media/app-tour.webm',
  poster: '/media/app-tour-poster.webp',
  /** Pôster no tamanho do vídeo (tela do iPhone 16 Pro reduzida de 1206x2622). */
  width: 590,
  height: 1282,
}

const ALT =
  'Tour pelo app Sagrada Gestão no iPhone: início com "O que eu devo" e a próxima gira, agenda, cantina e a área de gestão da casa.'

const REDUCE = '(prefers-reduced-motion: reduce)'
function subscribe(cb: () => void) {
  const mq = window.matchMedia(REDUCE)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
/** No servidor assume movimento reduzido: renderiza o pôster e só troca pelo vídeo no navegador. */
function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCE).matches,
    () => true,
  )
}

/** Vídeo do app dentro do PhoneFrame. Com movimento reduzido, mostra só o pôster. */
export function AppTourVideo({ eager = false }: { eager?: boolean }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(false)

  // Fora da tela, pausa (economiza bateria); de volta, retoma se a pessoa não pausou.
  useEffect(() => {
    const video = ref.current
    if (!video || paused) return
    // O React aplica `muted` como propriedade; garante antes do play (exigência do autoplay no iOS).
    video.muted = true
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {})
      else video.pause()
    })
    io.observe(video)
    return () => io.disconnect()
  }, [paused, reduced])

  if (reduced) {
    return (
      <Image
        src={APP_TOUR.poster}
        alt={ALT}
        width={APP_TOUR.width}
        height={APP_TOUR.height}
        sizes="(min-width: 1024px) 260px, 40vw"
        loading={eager ? 'eager' : 'lazy'}
        className="absolute inset-0 size-full object-cover"
      />
    )
  }

  function toggle() {
    const video = ref.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
      setPaused(false)
    } else {
      video.pause()
      setPaused(true)
    }
  }

  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 size-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={APP_TOUR.poster}
        aria-label={ALT}
      >
        <source src={APP_TOUR.webm} type="video/webm" />
        <source src={APP_TOUR.mp4} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={paused ? 'Reproduzir o vídeo do app' : 'Pausar o vídeo do app'}
        className="absolute right-[5cqw] bottom-[5cqw] flex size-[11cqw] min-h-6 min-w-6 items-center justify-center rounded-full bg-[#1b1c45]/70 text-white backdrop-blur-md transition hover:bg-[#1b1c45]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e1b75c]"
      >
        {paused ? <Play className="size-[45%]" aria-hidden="true" /> : <Pause className="size-[45%]" aria-hidden="true" />}
      </button>
    </>
  )
}
