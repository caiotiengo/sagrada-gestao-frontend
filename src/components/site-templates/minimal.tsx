'use client'

import Link from 'next/link'
import {
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  MapPin,
  Phone,
} from 'lucide-react'
import { useSiteContext } from '@/components/site/site-provider'
import { Separator } from '@/components/ui/separator'

const NAV_ITEMS = [
  { label: 'Início', href: '/' },
  { label: 'Listas', href: '/listas' },
  { label: 'Rifas', href: '/rifas' },
  { label: 'Loja', href: '/loja' },
]

export function MinimalTemplate() {
  const { house, events } = useSiteContext()
  const config = house.siteConfig
  const primaryColor = config?.primaryColor || '#6366f1'

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ '--site-primary': primaryColor } as React.CSSProperties}
    >
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {config?.logoUrl && config.logoUrl.startsWith('http') && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.logoUrl}
                alt={house.displayName}
                className="h-8 w-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            )}
            <span className="font-semibold text-gray-900">
              {house.displayName}
            </span>
          </div>
          <nav className="flex items-center gap-5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-gray-500 transition-colors hover:text-gray-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Title section — no big hero */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h1
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              style={{ color: primaryColor }}
            >
              {house.displayName}
            </h1>
            {house.description && (
              <p className="mt-4 max-w-2xl text-lg text-gray-500">
                {house.description}
              </p>
            )}
          </div>
        </section>

        {/* About */}
        {config?.aboutText && (
          <>
            <Separator className="mx-auto max-w-4xl" />
            <section className="py-16">
              <div className="mx-auto max-w-4xl px-4">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Sobre
                </h2>
                <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                  {config.aboutText}
                </p>
              </div>
            </section>
          </>
        )}

        {/* Upcoming Events */}
        {events.length > 0 && (
          <>
            <Separator className="mx-auto max-w-4xl" />
            <section className="py-16">
              <div className="mx-auto max-w-4xl px-4">
                <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Próximos Eventos
                </h2>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border-l-2 pl-4" style={{ borderColor: primaryColor }}>
                      <p className="font-medium text-gray-800">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.startDate).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {event.location && (
                        <p className="text-sm text-gray-500">
                          <MapPin className="mr-1 inline-block h-3.5 w-3.5" />
                          {event.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Social Links */}
        {(config?.instagramUrl ||
          config?.facebookUrl ||
          config?.youtubeUrl ||
          config?.whatsappNumber) && (
          <>
            <Separator className="mx-auto max-w-4xl" />
            <section className="py-16">
              <div className="mx-auto max-w-4xl px-4">
                <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Redes Sociais
                </h2>
                <div className="flex flex-col gap-2">
                  {config?.instagramUrl && (
                    <a
                      href={config.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="text-sm underline-offset-4 group-hover:underline">
                        Instagram
                      </span>
                    </a>
                  )}
                  {config?.facebookUrl && (
                    <a
                      href={config.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900"
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="text-sm underline-offset-4 group-hover:underline">
                        Facebook
                      </span>
                    </a>
                  )}
                  {config?.youtubeUrl && (
                    <a
                      href={config.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900"
                    >
                      <Youtube className="h-4 w-4" />
                      <span className="text-sm underline-offset-4 group-hover:underline">
                        YouTube
                      </span>
                    </a>
                  )}
                  {config?.whatsappNumber && (
                    <a
                      href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm underline-offset-4 group-hover:underline">
                        WhatsApp
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Contact */}
        <Separator className="mx-auto max-w-4xl" />
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Contato
            </h2>
            {house.address && (
              <p className="mb-3 flex items-center gap-3 text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                {house.address}
              </p>
            )}
            {house.contactNumbers.length > 0 && (
              <div className="flex flex-col gap-2">
                {house.contactNumbers.map((num) => (
                  <a
                    key={num}
                    href={`tel:${num}`}
                    className="flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900"
                  >
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{num}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} {house.displayName}
        </div>
      </footer>
    </div>
  )
}
