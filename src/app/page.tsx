import type { Metadata } from 'next'
import { Fraunces } from 'next/font/google'

import { LandingPage } from '@/components/landing/landing-page'
import { LandingAuthGate } from '@/components/landing/auth-gate'
import { LANDING_PRE_PAINT_SCRIPT } from '@/components/landing/pre-paint'
import { SITE_URL, siteUrl } from '@/constants'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  axes: ['SOFT', 'opsz'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const TITLE = 'Sagrada Gestão: gestão para terreiros e casas de axé'
const DESCRIPTION =
  'Mensalidades, extrato, cantina com fiado e estoque, agenda com presença, rifas, campanhas e o site da casa num lugar só. Menos tempo com planilha, mais tempo com o sagrado. Teste 14 dias grátis.'

// A landing é do domínio raiz: canônico e OG apontam para lá, mesmo em outro host
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    'gestão de terreiro',
    'sistema para terreiro',
    'mensalidade terreiro',
    'casa de axé',
    'umbanda',
    'candomblé',
    'tesouraria',
    'cantina',
    'site para terreiro',
  ],
  alternates: { canonical: siteUrl('/') },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl('/'),
    siteName: 'Sagrada Gestão',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: siteUrl('/og-landing.png'), width: 1200, height: 630, alt: 'Sagrada Gestão: menos tempo com planilha, mais tempo com o sagrado.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [siteUrl('/og-landing.png')],
  },
}

export default function HomePage() {
  return (
    <>
      {/* Antes da pintura: quem tem sessão salva não vê a landing piscar */}
      <script dangerouslySetInnerHTML={{ __html: LANDING_PRE_PAINT_SCRIPT }} />
      <LandingAuthGate />
      <LandingPage fontClassName={fraunces.variable} />
    </>
  )
}
