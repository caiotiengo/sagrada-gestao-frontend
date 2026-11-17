'use client'

import Link from 'next/link'
import { Lock, LogOut, UserRound } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useLogout } from '@/hooks/use-auth'
import { ROUTES } from '@/constants'
import { Button, buttonVariants } from '@/components/ui/button'

/**
 * Tela de quem NÃO é da liderança numa casa bloqueada por pagamento pendente.
 * Sem preço e sem link de pagamento: quem regulariza é a liderança.
 */
export function HouseSuspended() {
  const { profile, currentHouse, setCurrentHouse } = useAuthStore()
  const logout = useLogout()
  const others = (profile?.houses ?? []).filter((h) => h.houseId !== currentHouse?.houseId)

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4" data-testid="house-suspended">
      <div className="w-full max-w-md space-y-5 rounded-2xl border bg-card p-6 text-center shadow-sm">
        <Lock className="mx-auto size-10 text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Acesso da casa suspenso</h1>
          <p className="text-muted-foreground">
            {currentHouse?.houseName ? <strong>{currentHouse.houseName}</strong> : 'A casa'} está com o acesso suspenso.
            Fale com a liderança da casa.
          </p>
        </div>
        {others.length > 0 && (
          <div className="space-y-2 text-left">
            <p className="text-sm font-medium">Entrar em outra casa</p>
            {others.map((h) => (
              <Button key={h.houseId} variant="outline" className="w-full justify-start" onClick={() => setCurrentHouse(h)}>
                {h.houseName ?? h.houseSlug ?? 'Casa'}
              </Button>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href={ROUTES.PROFILE} className={buttonVariants({ variant: 'outline' })}>
            <UserRound className="size-4" /> Meu perfil
          </Link>
          <Button variant="ghost" onClick={() => logout.mutate()} disabled={logout.isPending}>
            <LogOut className="size-4" /> Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
