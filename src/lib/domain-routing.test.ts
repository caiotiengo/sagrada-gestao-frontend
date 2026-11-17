// Testes do roteamento por domínio: `npm test` (node --test, sem dependências).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { classifyHost, robotsTxt, routeRequest, sitemapXml, type DomainConfig } from './domain-routing.ts'

const PROD: DomainConfig = { baseDomain: 'sagradagestao.com.br', appUrl: 'https://app.sagradagestao.com.br' }
const LOCAL: DomainConfig = { baseDomain: 'localhost:3000', appUrl: 'http://localhost:3000' }
const LVH: DomainConfig = { baseDomain: 'lvh.me:3900', appUrl: 'http://app.lvh.me:3900' }

const route = (host: string, path: string, config = PROD) => {
  const [pathname, query] = path.split('?')
  return routeRequest({ host, pathname, search: query ? `?${query}` : '' }, config)
}

describe('domínio raiz', () => {
  const host = 'sagradagestao.com.br'

  for (const path of ['/', '/privacidade', '/termos', '/excluir-conta', '/termos/']) {
    it(`serve ${path}`, () => assert.deepEqual(route(host, path), { type: 'next', kind: 'root', noindex: false }))
  }

  for (const path of [
    '/og-landing.png',
    '/badges/app-store-pt-br.svg',
    '/media/app-tour.mp4',
    '/icon.svg',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/.well-known/apple-app-site-association',
    '/.well-known/assetlinks.json',
    '/_next/static/chunks/x.js',
  ]) {
    it(`serve o arquivo ${path} sem redirect`, () => assert.equal(route(host, path).type, 'next'))
  }

  for (const path of [
    '/login',
    '/cadastro',
    '/esqueci-senha',
    '/admin',
    '/admin/membros',
    '/membro/financeiro',
    '/perfil',
    '/c/casa-de-axe-exemplo-zpyf/cadastro?token=abc&x=1',
    '/c/casa/admin/convite?token=t',
    '/site/casa',
    '/privacidade-extra',
  ]) {
    it(`manda ${path} para o app com 308, mesmo path e query`, () => {
      assert.deepEqual(route(host, path), {
        type: 'redirect',
        kind: 'root',
        status: 308,
        location: `https://app.sagradagestao.com.br${path}`,
      })
    })
  }

  it('aceita o host com porta, maiúsculas e ponto final', () => {
    assert.equal(route('SagradaGestao.com.br.:443', '/login').type, 'redirect')
    assert.equal(route('SagradaGestao.com.br.:443', '/').type, 'next')
  })
})

describe('www', () => {
  it('308 para o raiz mantendo path e query', () => {
    assert.deepEqual(route('www.sagradagestao.com.br', '/termos?a=1'), {
      type: 'redirect',
      kind: 'www',
      status: 308,
      location: 'https://sagradagestao.com.br/termos?a=1',
    })
    assert.equal(
      (route('www.sagradagestao.com.br', '/login') as { location: string }).location,
      'https://sagradagestao.com.br/login',
    )
  })
})

describe('app', () => {
  const host = 'app.sagradagestao.com.br'

  it('"/" vai para o login (307, no mesmo host, mantém query)', () => {
    const login = 'https://app.sagradagestao.com.br/login'
    assert.deepEqual(route(host, '/'), { type: 'redirect', kind: 'app', status: 307, location: login })
    assert.deepEqual(route(host, '/?utm=x'), { type: 'redirect', kind: 'app', status: 307, location: `${login}?utm=x` })
    assert.equal((route('app.localhost:3000', '/', LOCAL) as { location: string }).location, 'http://app.localhost:3000/login')
  })

  for (const path of ['/login', '/admin', '/membro', '/c/casa/cadastro', '/site/casa', '/perfil']) {
    it(`serve ${path} com noindex`, () => assert.deepEqual(route(host, path), { type: 'next', kind: 'app', noindex: true }))
  }

  for (const path of ['/privacidade', '/termos', '/excluir-conta']) {
    it(`serve a página legal ${path} indexável`, () =>
      assert.deepEqual(route(host, path), { type: 'next', kind: 'app', noindex: false }))
  }

  for (const path of ['/.well-known/apple-app-site-association', '/.well-known/assetlinks.json', '/robots.txt']) {
    it(`serve ${path} sem redirect`, () => assert.deepEqual(route(host, path), { type: 'next', kind: 'app', noindex: false }))
  }

  it('lê o host do x-fh-requested-host antes do host interno', async () => {
    const { requestHost } = await import('./domain-routing.ts')
    const headers = new Headers({ host: 'sagrada-gestao-frontend-xyz.a.run.app', 'x-fh-requested-host': host })
    assert.equal(requestHost(headers), host)
    assert.equal(requestHost(new Headers({ host: 'localhost:3000' })), 'localhost:3000')
  })
})

describe('casa', () => {
  const host = 'casadeaxeexemplo.sagradagestao.com.br'

  it('reescreve para /site/<casa>', () => {
    assert.deepEqual(route(host, '/'), { type: 'rewrite', kind: 'house', pathname: '/site/casadeaxeexemplo', noindex: false })
    assert.deepEqual(route(host, '/loja'), {
      type: 'rewrite',
      kind: 'house',
      pathname: '/site/casadeaxeexemplo/loja',
      noindex: false,
    })
  })

  it('não reescreve robots.txt nem .well-known', () => {
    assert.equal(route(host, '/robots.txt').type, 'next')
    assert.equal(route(host, '/.well-known/assetlinks.json').type, 'next')
  })

  for (const sub of ['api', 'admin', 'static', 'mail', 'a.b', '-x']) {
    it(`subdomínio reservado/inválido "${sub}" dá 404`, () =>
      assert.deepEqual(route(`${sub}.sagradagestao.com.br`, '/'), { type: 'not-found', kind: 'reserved' }))
  }
})

describe('outros hosts', () => {
  it('URL do Cloud Run / web.app funciona como antes, sem indexar', () => {
    assert.deepEqual(route('sagrada-gestao.web.app', '/login'), { type: 'next', kind: 'local', noindex: true })
    assert.deepEqual(route('x.a.run.app', '/'), { type: 'next', kind: 'local', noindex: true })
  })
})

describe('desenvolvimento local', () => {
  it('localhost sem subdomínio: landing em / e o sistema nas rotas', () => {
    for (const path of ['/', '/login', '/admin', '/c/casa/cadastro', '/privacidade']) {
      assert.deepEqual(route('localhost:3000', path, LOCAL), { type: 'next', kind: 'local', noindex: false })
    }
    assert.deepEqual(route('127.0.0.1:3000', '/admin', LOCAL), { type: 'next', kind: 'local', noindex: false })
  })

  it('*.localhost continua sendo site de casa; app.localhost é o app', () => {
    assert.equal(classifyHost('tensc.localhost:3000', LOCAL).kind, 'house')
    assert.equal(route('tensc.localhost:3000', '/rifas', LOCAL).type, 'rewrite')
    assert.equal(classifyHost('app.localhost:3000', LOCAL).kind, 'app')
    // com outra base (lvh.me) o *.localhost segue funcionando como casa
    assert.equal(classifyHost('tensc.localhost:3900', LVH).kind, 'house')
  })

  it('lvh.me simula raiz, www, app e casa', () => {
    assert.deepEqual(route('lvh.me:3900', '/login', LVH), {
      type: 'redirect',
      kind: 'root',
      status: 308,
      location: 'http://app.lvh.me:3900/login',
    })
    assert.deepEqual(route('www.lvh.me:3900', '/', LVH), {
      type: 'redirect',
      kind: 'www',
      status: 308,
      location: 'http://lvh.me:3900/',
    })
    assert.equal(route('app.lvh.me:3900', '/', LVH).type, 'redirect')
    assert.equal(route('casa.lvh.me:3900', '/', LVH).type, 'rewrite')
  })
})

describe('robots.txt e sitemap.xml', () => {
  it('raiz: indexável e aponta o sitemap', () => {
    assert.match(robotsTxt('sagradagestao.com.br', PROD)!, /Allow: \/\n\nSitemap: https:\/\/sagradagestao\.com\.br\/sitemap\.xml/)
  })
  it('app e casa: rastreáveis, sem sitemap', () => {
    assert.equal(robotsTxt('app.sagradagestao.com.br', PROD), 'User-agent: *\nAllow: /\n')
    assert.equal(robotsTxt('casa.sagradagestao.com.br', PROD), 'User-agent: *\nAllow: /\n')
  })
  it('host desconhecido: bloqueado', () => {
    assert.equal(robotsTxt('sagrada-gestao.web.app', PROD), 'User-agent: *\nDisallow: /\n')
  })
  it('sitemap só no raiz, com landing e páginas legais', () => {
    const xml = sitemapXml('sagradagestao.com.br', PROD)!
    for (const loc of ['/', '/privacidade', '/termos', '/excluir-conta']) {
      assert.ok(xml.includes(`<loc>https://sagradagestao.com.br${loc}</loc>`), loc)
    }
    assert.equal(sitemapXml('app.sagradagestao.com.br', PROD), null)
    assert.equal(sitemapXml('casa.sagradagestao.com.br', PROD), null)
  })
})
