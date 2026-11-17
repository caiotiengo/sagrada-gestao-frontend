import { DOMAIN_CONFIG, requestHost, sitemapXml } from '@/lib/domain-routing'

// Só existe no domínio raiz: depende do host
export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  const body = sitemapXml(requestHost(request.headers), DOMAIN_CONFIG)
  if (body === null) return new Response('Not found', { status: 404 })
  return new Response(body, {
    headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  })
}
