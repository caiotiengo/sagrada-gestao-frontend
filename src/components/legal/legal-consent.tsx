import Link from 'next/link'

import { ROUTES } from '@/constants'

/** Aviso abaixo dos formulários de cadastro, com os links dos documentos. */
export function LegalConsentNote() {
  return (
    <p className="mt-4 text-center text-xs text-muted-foreground">
      Ao cadastrar, você concorda com os{' '}
      <Link href={ROUTES.TERMS} className="font-medium text-primary hover:underline">
        Termos de uso
      </Link>{' '}
      e com a{' '}
      <Link href={ROUTES.PRIVACY} className="font-medium text-primary hover:underline">
        Política de privacidade
      </Link>
      .
    </p>
  )
}
