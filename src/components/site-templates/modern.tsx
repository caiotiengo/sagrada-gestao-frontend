'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  MapPin,
  Phone,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { useSiteContext } from '@/components/site/site-provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const NAV_ITEMS = [
  { label: 'Início', href: '/' },
  { label: 'Campanhas', href: '/listas' },
  { label: 'Rifas', href: '/rifas' },
  { label: 'Loja', href: '/loja' },
]

export function ModernTemplate() {
  const { house } = useSiteContext()
  const config = house.siteConfig
  const primaryColor = config?.primaryColor || '#6366f1'
  const secondaryColor = config?.secondaryColor || '#8b5cf6'
  const gradient = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`

  return (
    <div
      className="flex min-h-screen flex-col"
      style={
        {
          '--site-primary': primaryColor,
          '--site-secondary': secondaryColor,
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 text-white shadow-lg"
        style={{ background: gradient }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {config?.logoUrl && (
              <Image
                src={config.logoUrl}
                alt={house.displayName}
                width={36}
                height={36}
                className="rounded-full object-cover ring-2 ring-white/30"
              />
            )}
            <span className="text-lg font-bold">{house.displayName}</span>
          </div>
          <nav className="hidden items-center gap-5 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-white/90 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {/* Mobile nav */}
          <nav className="flex items-center gap-3 md:hidden">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-medium text-white/80 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[480px] items-center justify-center overflow-hidden">
        {config?.heroImageUrl && (
          <Image
            src={config.heroImageUrl}
            alt="Banner"
            fill
            className="object-cover"
            priority
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}dd, ${secondaryColor}bb)`,
          }}
        />
        <div className="relative z-10 px-4 text-center text-white">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            {house.displayName}
          </h1>
          {house.description && (
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 sm:text-xl">
              {house.description}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/listas">
              <Button
                size="lg"
                className="rounded-full bg-white font-semibold text-gray-900 hover:bg-gray-100"
              >
                Ver Campanhas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/loja">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/50 font-semibold text-white hover:bg-white/10"
              >
                Visitar Loja
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      {config?.aboutText && (
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4">
            <Card className="overflow-hidden rounded-2xl border-0 shadow-xl">
              <div className="p-8 sm:p-12">
                <h2 className="mb-6 text-3xl font-bold" style={{ color: primaryColor }}>
                  Sobre Nós
                </h2>
                <p className="whitespace-pre-line text-lg text-gray-600 leading-relaxed">
                  {config.aboutText}
                </p>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Gira Schedule */}
      {(config?.giraScheduleText || house.daysOfGira.length > 0) && (
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h2
              className="mb-10 text-center text-3xl font-bold"
              style={{ color: primaryColor }}
            >
              Agenda de Giras
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {house.daysOfGira.map((day) => (
                <Card
                  key={day}
                  className="flex items-center gap-4 rounded-xl border-0 p-6 shadow-md"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ background: gradient }}
                  >
                    <Calendar className="h-6 w-6" />
                  </div>
                  <span className="text-lg font-semibold text-gray-800">
                    {day}
                  </span>
                </Card>
              ))}
            </div>
            {config?.giraScheduleText && (
              <Card className="mt-6 rounded-xl border-0 p-6 shadow-md">
                <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                  {config.giraScheduleText}
                </p>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Social Links */}
      {(config?.instagramUrl ||
        config?.facebookUrl ||
        config?.youtubeUrl ||
        config?.whatsappNumber) && (
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2
              className="mb-10 text-3xl font-bold"
              style={{ color: primaryColor }}
            >
              Conecte-se
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {config?.instagramUrl && (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  >
                    <Instagram className="mr-2 h-5 w-5" />
                    Instagram
                  </Button>
                </a>
              )}
              {config?.facebookUrl && (
                <a
                  href={config.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Facebook className="mr-2 h-5 w-5" />
                    Facebook
                  </Button>
                </a>
              )}
              {config?.youtubeUrl && (
                <a
                  href={config.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="rounded-full bg-red-600 text-white hover:bg-red-700"
                  >
                    <Youtube className="mr-2 h-5 w-5" />
                    YouTube
                  </Button>
                </a>
              )}
              {config?.whatsappNumber && (
                <a
                  href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="rounded-full bg-green-500 text-white hover:bg-green-600"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp
                  </Button>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section
        className="py-20 text-white"
        style={{ background: gradient }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-8 text-3xl font-bold">Entre em Contato</h2>
          {house.address && (
            <p className="mb-4 flex items-center justify-center gap-2 text-lg text-white/90">
              <MapPin className="h-5 w-5 shrink-0" />
              {house.address}
            </p>
          )}
          {house.contactNumbers.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-6">
              {house.contactNumbers.map((num) => (
                <a
                  key={num}
                  href={`tel:${num}`}
                  className="flex items-center gap-2 text-lg text-white/90 transition-colors hover:text-white"
                >
                  <Phone className="h-5 w-5" />
                  {num}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 text-white/70"
        style={{ background: gradient }}
      >
        <div className="mx-auto max-w-6xl border-t border-white/20 px-4 pt-8">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} {house.displayName}. Todos os
              direitos reservados.
            </p>
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
        </div>
      </footer>
    </div>
  )
}
