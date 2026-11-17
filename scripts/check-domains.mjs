// Confere o roteamento por domínio num servidor rodando, simulando o Firebase
// Hosting (header x-fh-requested-host). O build precisa ter as envs de produção:
//
//   NEXT_PUBLIC_BASE_DOMAIN=sagradagestao.com.br \
//   NEXT_PUBLIC_APP_URL=https://app.sagradagestao.com.br \
//   npm run build && npx next start -p 3900
//   npm run test:domains            # ou: TARGET=http://localhost:3900 node scripts/check-domains.mjs
//
// Não toca em produção: só faz GET no servidor local.

const TARGET = process.env.TARGET || 'http://localhost:3900'
const ROOT = 'sagradagestao.com.br'
const APP = `app.${ROOT}`
const HOUSE = `casadeaxeexemplo.${ROOT}`

/** [host, path, status esperado, Location esperado (ou null), extra] */
const CASES = [
  // domínio raiz
  [ROOT, '/', 200, null, { bodyIncludes: 'og-landing.png', noRobotsTag: true }],
  [ROOT, '/privacidade', 200, null, { bodyIncludes: `https://${ROOT}/privacidade` }],
  [ROOT, '/termos', 200],
  [ROOT, '/excluir-conta', 200],
  [ROOT, '/og-landing.png', 200],
  [ROOT, '/badges/app-store-pt-br.svg', 200],
  [ROOT, '/icon.svg', 200],
  [ROOT, '/robots.txt', 200, null, { bodyIncludes: `Sitemap: https://${ROOT}/sitemap.xml` }],
  [ROOT, '/sitemap.xml', 200, null, { bodyIncludes: `<loc>https://${ROOT}/termos</loc>` }],
  [ROOT, '/.well-known/apple-app-site-association', 200, null, { contentType: 'application/json' }],
  [ROOT, '/login', 308, `https://${APP}/login`],
  [ROOT, '/cadastro', 308, `https://${APP}/cadastro`],
  [ROOT, '/admin/membros', 308, `https://${APP}/admin/membros`],
  [ROOT, '/c/casa-x/cadastro?token=abc', 308, `https://${APP}/c/casa-x/cadastro?token=abc`],
  // www
  [`www.${ROOT}`, '/', 308, `https://${ROOT}/`],
  [`www.${ROOT}`, '/termos?a=1', 308, `https://${ROOT}/termos?a=1`],
  // app
  [APP, '/', 307, `https://${APP}/login`],
  [APP, '/login', 200, null, { robotsTag: 'noindex' }],
  [APP, '/privacidade', 200, null, { noRobotsTag: true }],
  [APP, '/termos', 200],
  [APP, '/.well-known/apple-app-site-association', 200, null, { contentType: 'application/json' }],
  [APP, '/.well-known/assetlinks.json', 200, null, { contentType: 'application/json' }],
  [APP, '/c/casa-x/cadastro?token=abc', 200, null, { robotsTag: 'noindex' }],
  [APP, '/sitemap.xml', 404],
  // casa
  [HOUSE, '/robots.txt', 200, null, { bodyIncludes: 'Allow: /' }],
  [HOUSE, '/.well-known/assetlinks.json', 200],
  // reservados
  [`api.${ROOT}`, '/', 404],
  [`admin.${ROOT}`, '/login', 404],
]

let failed = 0
for (const [host, path, status, location, extra = {}] of CASES) {
  const res = await fetch(`${TARGET}${path}`, { redirect: 'manual', headers: { 'x-fh-requested-host': host } })
  const problems = []
  if (res.status !== status) problems.push(`status ${res.status} (esperado ${status})`)
  if (location !== undefined && location !== null && res.headers.get('location') !== location) {
    problems.push(`location ${res.headers.get('location')} (esperado ${location})`)
  }
  const robots = res.headers.get('x-robots-tag') || ''
  if (extra.robotsTag && !robots.includes(extra.robotsTag)) problems.push(`x-robots-tag "${robots}"`)
  if (extra.noRobotsTag && robots) problems.push(`x-robots-tag inesperado "${robots}"`)
  if (extra.contentType && !(res.headers.get('content-type') || '').includes(extra.contentType)) {
    problems.push(`content-type ${res.headers.get('content-type')}`)
  }
  if (extra.bodyIncludes) {
    const body = await res.text()
    if (!body.includes(extra.bodyIncludes)) problems.push(`corpo sem "${extra.bodyIncludes}"`)
  }
  const label = `${host}${path}`.padEnd(62)
  if (problems.length) {
    failed++
    console.log(`FALHA ${label} ${problems.join('; ')}`)
  } else {
    console.log(`ok    ${label} ${res.status}${res.headers.get('location') ? ` -> ${res.headers.get('location')}` : ''}`)
  }
}

console.log(failed ? `\n${failed} de ${CASES.length} falharam` : `\n${CASES.length} verificações ok`)
process.exit(failed ? 1 : 0)
