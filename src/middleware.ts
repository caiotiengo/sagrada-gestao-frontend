import { NextRequest, NextResponse } from 'next/server'

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000'
const APP_SUBDOMAIN = 'app'

export function middleware(request: NextRequest) {
  // Firebase Hosting proxies requests and sends the original host in x-fh-requested-host
  const host = request.headers.get('x-fh-requested-host') || request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  // Remove port for comparison
  const hostname = host.split(':')[0]
  const baseDomain = BASE_DOMAIN.split(':')[0]

  // Check if this is a subdomain request
  if (hostname !== baseDomain && hostname.endsWith(`.${baseDomain}`)) {
    const subdomain = hostname.replace(`.${baseDomain}`, '')

    // Skip reserved subdomains (app, www, etc.)
    if (subdomain === APP_SUBDOMAIN || subdomain === 'www') {
      return NextResponse.next()
    }

    // Rewrite to /site/[subdomain]/...
    const url = request.nextUrl.clone()
    url.pathname = `/site/${subdomain}${pathname}`
    return NextResponse.rewrite(url)
  }

  // Also handle localhost subdomains for development (e.g., tensc.localhost:3000)
  if (hostname !== 'localhost' && hostname.endsWith('.localhost')) {
    const subdomain = hostname.replace('.localhost', '')
    const url = request.nextUrl.clone()
    url.pathname = `/site/${subdomain}${pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|__/).*)',
  ],
}
