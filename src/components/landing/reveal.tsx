'use client'

import { useEffect } from 'react'

/**
 * Entrada suave dos blocos marcados com .l-reveal quando chegam à tela.
 * O CSS só esconde os blocos quando há JS e movimento permitido; aqui só
 * marcamos data-in. Atraso opcional por bloco via style="--d: 120ms".
 */
export function RevealOnScroll() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.landing .l-reveal:not([data-in])'))
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.setAttribute('data-in', ''))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-in', '')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
