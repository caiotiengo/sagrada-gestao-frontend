import { NextRequest, NextResponse } from 'next/server'

import { DOMAIN_CONFIG, requestHost, routeRequest } from '@/lib/domain-routing'

const NOINDEX = 'noindex, nofollow'

export function middleware(request: NextRequest) {
  // Firebase Hosting faz proxy para o Cloud Run e manda o host original em x-fh-requested-host
  const host = requestHost(request.headers)
  const { pathname, search } = request.nextUrl

  const decision = routeRequest({ host, pathname, search }, DOMAIN_CONFIG)

  switch (decision.type) {
    case 'redirect':
      // Sempre absoluto e montado com o host original: atrás do Hosting o
      // request.nextUrl tem o host interno do Cloud Run, não o do usuário.
      return NextResponse.redirect(decision.location, decision.status)
    case 'not-found':
      return new NextResponse('Not found', {
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': NOINDEX },
      })
    case 'rewrite': {
      const url = request.nextUrl.clone()
      url.pathname = decision.pathname
      const res = NextResponse.rewrite(url)
      if (decision.noindex) res.headers.set('x-robots-tag', NOINDEX)
      return res
    }
    case 'next': {
      const res = NextResponse.next()
      if (decision.noindex) res.headers.set('x-robots-tag', NOINDEX)
      return res
    }
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|og-landing.png|badges/|media/|__/).*)',
  ],
}
