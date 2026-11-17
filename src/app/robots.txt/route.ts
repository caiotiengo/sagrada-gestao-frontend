import { DOMAIN_CONFIG, requestHost, robotsTxt } from '@/lib/domain-routing'

// Depende do host (raiz, app, casa): não pode ser estático
export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  const body = robotsTxt(requestHost(request.headers), DOMAIN_CONFIG)
  if (body === null) return new Response('Not found', { status: 404 })
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  })
}
