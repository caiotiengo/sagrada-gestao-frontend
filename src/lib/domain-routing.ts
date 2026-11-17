// ========================================
// Roteamento por domínio (usado pelo middleware)
// ========================================
//
// Um único deploy atende todos os domínios:
//
//   sagradagestao.com.br          landing de vendas + páginas legais + assets
//   www.sagradagestao.com.br      308 para o domínio raiz (mesmo path)
//   app.sagradagestao.com.br      o sistema; "/" vai para o login
//   <casa>.sagradagestao.com.br   site público da casa (rewrite para /site/<casa>)
//
// Em localhost (sem subdomínio) nada muda: landing em "/" e o sistema nas rotas.
// Para simular os domínios localmente, veja docs/DOMINIOS.md.
//
// Este arquivo não importa nada (nem do Next) para rodar direto no `node --test`.

export interface DomainConfig {
  /** Domínio base, com porta opcional. Ex.: "sagradagestao.com.br", "lvh.me:3900", "localhost:3000". */
  baseDomain: string
  /** URL do sistema. Ex.: "https://app.sagradagestao.com.br". */
  appUrl: string
}

/** Config do build (as NEXT_PUBLIC_* são fixadas no build). */
export const DOMAIN_CONFIG: DomainConfig = {
  baseDomain: process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}

export type HostKind =
  /** localhost/127.0.0.1 ou host desconhecido (run.app, web.app): comportamento antigo, tudo liberado */
  | 'local'
  | 'root'
  | 'www'
  | 'app'
  | 'house'
  /** subdomínio reservado ou inválido: nunca vira site de casa */
  | 'reserved'

export type RouteDecision =
  | { type: 'next'; kind: HostKind; noindex: boolean }
  | { type: 'rewrite'; kind: HostKind; pathname: string; noindex: boolean }
  | { type: 'redirect'; kind: HostKind; location: string; status: 307 | 308 }
  | { type: 'not-found'; kind: HostKind }

export const APP_SUBDOMAIN = 'app'
export const WWW_SUBDOMAIN = 'www'

/**
 * Subdomínios que nunca viram site de casa. Mesma lista do back
 * (functions/src/schemas/house.schemas.ts RESERVED_SUBDOMAINS) mais "static".
 * Não aumentar sem conferir se alguma casa já usa o nome: ela sairia do ar.
 */
export const RESERVED_SUBDOMAINS: ReadonlySet<string> = new Set([
  APP_SUBDOMAIN,
  WWW_SUBDOMAIN,
  'api',
  'admin',
  'static',
  'mail',
  'ftp',
  'smtp',
  'pop',
  'imap',
])

/** Páginas que o domínio raiz serve (fora isso, vai tudo para o app). */
export const ROOT_PAGES: ReadonlySet<string> = new Set(['/', '/privacidade', '/termos', '/excluir-conta'])

/** Páginas legais: indexáveis e acessíveis também no app (links do app mobile e do Stripe). */
export const LEGAL_PAGES: ReadonlySet<string> = new Set(['/privacidade', '/termos', '/excluir-conta'])

/** Respondem igual em qualquer host, sem redirect nem rewrite. */
const PASSTHROUGH_PREFIXES = ['/.well-known/', '/_next/', '/__/']
const PASSTHROUGH_FILES = new Set(['/robots.txt', '/sitemap.xml'])

/** Arquivos estáticos (public/ e ícones do app/) que o domínio raiz também serve. */
const ROOT_ASSET_PREFIXES = ['/badges/', '/media/']
const ROOT_ASSET_FILES = new Set([
  '/favicon.ico',
  '/icon.svg',
  '/apple-icon.png',
  '/og-landing.png',
  '/firebase-messaging-sw.js',
])

const HOUSE_SUBDOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

/** "Sagrada.com.br:443." → "sagrada.com.br" */
export function normalizeHost(host: string): string {
  const first = host.split(',')[0].trim().toLowerCase()
  // IPv6 entre colchetes: mantém como está (não é domínio nosso)
  if (first.startsWith('[')) return first
  return first.split(':')[0].replace(/\.$/, '')
}

function stripTrailingSlash(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

function isPassthrough(pathname: string): boolean {
  return PASSTHROUGH_FILES.has(pathname) || PASSTHROUGH_PREFIXES.some((p) => pathname.startsWith(p))
}

function isRootPath(pathname: string): boolean {
  const p = stripTrailingSlash(pathname)
  return ROOT_PAGES.has(p) || ROOT_ASSET_FILES.has(p) || ROOT_ASSET_PREFIXES.some((prefix) => p.startsWith(prefix))
}

export function isLegalPath(pathname: string): boolean {
  return LEGAL_PAGES.has(stripTrailingSlash(pathname))
}

function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '0.0.0.0'
}

/** Protocolo das URLs geradas (http em dev, https em produção), tirado do appUrl. */
function protocolOf(appUrl: string): string {
  try {
    return new URL(appUrl).protocol
  } catch {
    return 'https:'
  }
}

/** Origem do domínio raiz (landing). Ex.: "https://sagradagestao.com.br". */
export function siteOrigin(config: DomainConfig): string {
  return `${protocolOf(config.appUrl)}//${config.baseDomain}`
}

/** Origem do app. Ex.: "https://app.sagradagestao.com.br". */
export function appOrigin(config: DomainConfig): string {
  try {
    return new URL(config.appUrl).origin
  } catch {
    return `${protocolOf(config.appUrl)}//${APP_SUBDOMAIN}.${config.baseDomain}`
  }
}

export function classifyHost(rawHost: string, config: DomainConfig): { kind: HostKind; subdomain?: string } {
  const hostname = normalizeHost(rawHost)
  const base = normalizeHost(config.baseDomain)

  // Dev: localhost puro mantém o comportamento antigo (landing + sistema no mesmo host)
  if (!hostname || isLocalHostname(hostname)) return { kind: 'local' }

  // Base "localhost" e host "x.localhost": simulação de subdomínio em dev
  const effectiveBase = hostname.endsWith('.localhost') && !hostname.endsWith(`.${base}`) ? 'localhost' : base

  if (hostname === effectiveBase) return { kind: 'root' }
  if (!hostname.endsWith(`.${effectiveBase}`)) return { kind: 'local' }

  const subdomain = hostname.slice(0, -(effectiveBase.length + 1))
  if (subdomain === WWW_SUBDOMAIN) return { kind: 'www', subdomain }
  if (subdomain === APP_SUBDOMAIN) return { kind: 'app', subdomain }
  if (RESERVED_SUBDOMAINS.has(subdomain) || !HOUSE_SUBDOMAIN_RE.test(subdomain)) {
    return { kind: 'reserved', subdomain }
  }
  return { kind: 'house', subdomain }
}

/**
 * Decide o que fazer com a requisição.
 * `host` é o host original (x-fh-requested-host no Firebase Hosting); `search` inclui o "?".
 */
export function routeRequest(
  req: { host: string; pathname: string; search?: string },
  config: DomainConfig,
): RouteDecision {
  const { pathname } = req
  const search = req.search ?? ''
  const { kind, subdomain } = classifyHost(req.host, config)

  switch (kind) {
    case 'local':
      // Host desconhecido (URL do Cloud Run, *.web.app): funciona, mas não indexa
      return { type: 'next', kind, noindex: !isLocalHostname(normalizeHost(req.host)) && normalizeHost(req.host) !== '' }

    case 'reserved':
      return { type: 'not-found', kind }

    case 'www':
      return { type: 'redirect', kind, status: 308, location: `${siteOrigin(config)}${pathname}${search}` }

    case 'root':
      if (isPassthrough(pathname) || isRootPath(pathname)) return { type: 'next', kind, noindex: false }
      return { type: 'redirect', kind, status: 308, location: `${appOrigin(config)}${pathname}${search}` }

    case 'app':
      if (isPassthrough(pathname)) return { type: 'next', kind, noindex: false }
      // "/" no app é o login (que manda quem já está logado para a área dele).
      // 307: é decisão de navegação, não mudança permanente de endereço.
      // Absoluto no próprio host do usuário (o Next exige Location absoluto).
      if (pathname === '/') {
        const host = req.host.split(',')[0].trim().toLowerCase().replace(/\.(?=:|$)/, '')
        return { type: 'redirect', kind, status: 307, location: `${protocolOf(config.appUrl)}//${host}/login${search}` }
      }
      // O sistema não é indexado; as páginas legais são (canônico no domínio raiz).
      return { type: 'next', kind, noindex: !isLegalPath(pathname) }

    case 'house':
      if (isPassthrough(pathname)) return { type: 'next', kind, noindex: false }
      return { type: 'rewrite', kind, pathname: `/site/${subdomain}${pathname === '/' ? '' : pathname}`, noindex: false }
  }
}

/** Host original da requisição: o Firebase Hosting manda em x-fh-requested-host. */
export function requestHost(headers: { get(name: string): string | null }): string {
  return headers.get('x-fh-requested-host') || headers.get('x-forwarded-host') || headers.get('host') || ''
}

/** Páginas do sitemap do domínio raiz. */
export const SITEMAP_PATHS: readonly string[] = ['/', '/privacidade', '/termos', '/excluir-conta']

/** Conteúdo do robots.txt por host (null = 404). */
export function robotsTxt(rawHost: string, config: DomainConfig): string | null {
  const { kind } = classifyHost(rawHost, config)
  const hostname = normalizeHost(rawHost)
  switch (kind) {
    case 'root':
      return `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin(config)}/sitemap.xml\n`
    case 'app':
      // Rastreável para o robô ver o "X-Robots-Tag: noindex" das rotas do sistema;
      // as páginas legais têm canônico no domínio raiz.
      return 'User-agent: *\nAllow: /\n'
    case 'house':
      return 'User-agent: *\nAllow: /\n'
    case 'local':
      return isLocalHostname(hostname) || hostname === '' ? 'User-agent: *\nAllow: /\n' : 'User-agent: *\nDisallow: /\n'
    case 'www':
    case 'reserved':
      return null
  }
}

/** sitemap.xml: só no domínio raiz (e em localhost, para conferir). */
export function sitemapXml(rawHost: string, config: DomainConfig): string | null {
  const { kind } = classifyHost(rawHost, config)
  const hostname = normalizeHost(rawHost)
  if (kind !== 'root' && !(kind === 'local' && isLocalHostname(hostname))) return null
  const origin = siteOrigin(config)
  const urls = SITEMAP_PATHS.map(
    (p) => `  <url><loc>${origin}${p === '/' ? '/' : p}</loc><changefreq>${p === '/' ? 'weekly' : 'yearly'}</changefreq><priority>${p === '/' ? '1.0' : '0.3'}</priority></url>`,
  ).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}
