'use client'

import Link from 'next/link'
import { useSiteContext } from '@/components/site/site-provider'
import { Button } from '@/components/ui/button'

export default function SiteRafflesPage() {
  const { house } = useSiteContext()

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Rifas</h1>
      <p className="text-gray-500">
        Em breve as rifas estarão disponíveis aqui.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline" size="sm">
            Voltar ao início
          </Button>
        </Link>
        <Link href={`/c/${house.slug}`}>
          <Button size="sm">Ver no site principal</Button>
        </Link>
      </div>
    </div>
  )
}
