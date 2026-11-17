'use client'

import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Home } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'

/**
 * Casa atual e, para quem participa de mais de uma, a troca de casa.
 * Sem isto, no web só dava para usar a primeira casa do perfil.
 */
export function HouseSwitcher({ className }: { className?: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { profile, currentHouse, setCurrentHouse } = useAuthStore()
  const houses = profile?.houses ?? []
  if (!currentHouse) return null
  const label = (h: { houseName: string | null; houseSlug: string | null }) => h.houseName ?? h.houseSlug ?? 'Casa'

  if (houses.length < 2) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground', className)} data-testid="current-house">
        <Home className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">{label(currentHouse)}</span>
      </div>
    )
  }

  return (
    <label className={cn('flex flex-col gap-1 px-3 py-1.5 text-xs text-muted-foreground', className)}>
      <span>Casa</span>
      <select
        data-testid="house-switcher"
        className="h-8 w-full truncate rounded-md border border-border bg-background px-2 text-sm text-foreground"
        value={currentHouse.houseId}
        onChange={(e) => {
          const next = houses.find((h) => h.houseId === e.target.value)
          if (!next || next.houseId === currentHouse.houseId) return
          setCurrentHouse(next)
          void queryClient.invalidateQueries()
          router.push(next.role === 'admin' ? ROUTES.ADMIN_HOME : ROUTES.MEMBER_HOME)
        }}
      >
        {houses.map((h) => (
          <option key={h.houseId} value={h.houseId}>{label(h)}</option>
        ))}
      </select>
    </label>
  )
}
