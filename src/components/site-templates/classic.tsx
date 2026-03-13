'use client'

import Link from 'next/link'
import {
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  MapPin,
  Phone,
  Calendar,
} from 'lucide-react'
import { useSiteContext } from '@/components/site/site-provider'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { label: 'Início', href: '/' },
  { label: 'Listas', href: '/listas' },
  { label: 'Rifas', href: '/rifas' },
  { label: 'Loja', href: '/loja' },
]

export function ClassicTemplate() {
  const { house, events } = useSiteContext()
  const config = house.siteConfig
  const primaryColor = config?.primaryColor || '#6366f1'

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ '--site-primary': primaryColor } as React.CSSProperties}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-3">
          <nav className="flex items-center gap-6">
            {config?.logoUrl && config.logoUrl.startsWith('http') && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.logoUrl}
                alt={house.displayName}
                className="mr-4 h-10 w-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            )}
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-[var(--site-primary)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-gray-900">
        {config?.heroImageUrl && config.heroImageUrl.startsWith('http') && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.heroImageUrl}
            alt="Banner"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="relative z-10 px-4 text-center text-white">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {house.displayName}
          </h1>
          {house.description && (
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-200">
              {house.description}
            </p>
          )}
        </div>
      </section>

      {/* About */}
      {config?.aboutText && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2
              className="mb-6 text-2xl font-bold"
              style={{ color: primaryColor }}
            >
              Sobre Nós
            </h2>
            <p className="whitespace-pre-line text-gray-600 leading-relaxed">
              {config.aboutText}
            </p>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2
              className="mb-6 text-2xl font-bold"
              style={{ color: primaryColor }}
            >
              <Calendar className="mr-2 inline-block h-6 w-6" />
              Próximos Eventos
            </h2>
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-gray-200 px-5 py-4 text-left"
                >
                  <p className="font-semibold text-gray-800">{event.title}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(event.startDate).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {event.location && (
                    <p className="mt-1 text-sm text-gray-500">
                      <MapPin className="mr-1 inline-block h-3.5 w-3.5" />
                      {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Links */}
      {(config?.instagramUrl ||
        config?.facebookUrl ||
        config?.youtubeUrl ||
        config?.whatsappNumber) && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2
              className="mb-6 text-2xl font-bold"
              style={{ color: primaryColor }}
            >
              Redes Sociais
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {config?.instagramUrl && (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Instagram className="h-5 w-5 text-pink-500" />
                  Instagram
                </a>
              )}
              {config?.facebookUrl && (
                <a
                  href={config.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Facebook className="h-5 w-5 text-blue-600" />
                  Facebook
                </a>
              )}
              {config?.youtubeUrl && (
                <a
                  href={config.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Youtube className="h-5 w-5 text-red-600" />
                  YouTube
                </a>
              )}
              {config?.whatsappNumber && (
                <a
                  href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2
            className="mb-6 text-2xl font-bold"
            style={{ color: primaryColor }}
          >
            Contato
          </h2>
          {house.address && (
            <p className="mb-3 flex items-center justify-center gap-2 text-gray-600">
              <MapPin className="h-5 w-5 shrink-0" style={{ color: primaryColor }} />
              {house.address}
            </p>
          )}
          {house.contactNumbers.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {house.contactNumbers.map((num) => (
                <a
                  key={num}
                  href={`tel:${num}`}
                  className="flex items-center gap-2 text-gray-600 transition-colors hover:text-[var(--site-primary)]"
                >
                  <Phone className="h-4 w-4" />
                  {num}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-900 py-10 text-gray-400">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <p className="font-semibold text-white">{house.displayName}</p>
              {house.address && (
                <p className="mt-1 text-sm">{house.address}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {config?.instagramUrl && (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {config?.facebookUrl && (
                <a
                  href={config.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {config?.youtubeUrl && (
                <a
                  href={config.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {config?.whatsappNumber && (
                <a
                  href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
          <div className="mt-6 border-t border-gray-800 pt-6 text-center text-xs">
            &copy; {new Date().getFullYear()} {house.displayName}. Todos os
            direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
