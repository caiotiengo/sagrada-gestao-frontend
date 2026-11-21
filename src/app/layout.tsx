import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

import { APP_NAME, APP_TITLE, APP_DESCRIPTION, APP_URL } from '@/constants'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

// Mono aparece em poucas telas: sem preload, baixa só onde for usada.
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_TITLE,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
