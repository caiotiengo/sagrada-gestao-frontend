import Link from 'next/link'
import { ROUTES } from '@/constants'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        O endereço que você abriu não existe ou foi removido.
      </p>
      <Link href={ROUTES.LOGIN} className="text-sm font-medium text-primary hover:underline">
        Ir para o início
      </Link>
    </div>
  )
}
