'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getStoredHomeRoute } from '@/stores/auth'
import { APP_URL, ROUTES, appUrl } from '@/constants'

import { AUTHED_ATTR } from './pre-paint'

/** Confirma a sessão no Firebase: logado vai para a área dele; senão, mostra a landing. */
export function LandingAuthGate() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const home = user ? getStoredHomeRoute() : null
      if (home) {
        const target = home === 'admin' ? ROUTES.ADMIN_HOME : ROUTES.MEMBER_HOME
        // No domínio raiz (produção) o sistema mora em outro host: navegação completa
        if (new URL(APP_URL).origin !== window.location.origin) window.location.replace(appUrl(target))
        else router.replace(target)
        return
      }
      document.documentElement.removeAttribute(AUTHED_ATTR)
    })
    return () => unsubscribe()
  }, [router])

  return (
    <div className="landing-gate min-h-dvh items-center justify-center bg-background" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Abrindo a sua casa...</p>
      </div>
    </div>
  )
}
