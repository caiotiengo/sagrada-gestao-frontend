# Domínios: landing no raiz, sistema no `app`

Um único deploy (Cloud Run `sagrada-gestao-frontend`, southamerica-east1, atrás do
Firebase Hosting) atende todos os domínios. O Hosting reescreve tudo para o Cloud Run
e manda o host original no header `x-fh-requested-host`; o `src/middleware.ts` decide
o que fazer com base nele. As regras ficam em `src/lib/domain-routing.ts`.

## Regras

| Host | Comportamento |
| --- | --- |
| `sagradagestao.com.br` | Serve `/` (landing), `/privacidade`, `/termos`, `/excluir-conta`, `robots.txt`, `sitemap.xml`, `/.well-known/*` e os arquivos estáticos (og image, selos, `/media`, ícones). **Qualquer outra rota** → `308` para `https://app.sagradagestao.com.br` com o mesmo path e query (login, cadastro, admin, membro, convite `/c/...`, etc.). |
| `www.sagradagestao.com.br` | `308` para `https://sagradagestao.com.br` com o mesmo path e query. |
| `app.sagradagestao.com.br` | O sistema. `/` → `307` para `/login` (o login manda quem já está logado para a área dele). Páginas legais e `/.well-known/*` funcionam aqui (é o domínio dos universal links e dos links do app e do Stripe). Rotas do sistema saem com `X-Robots-Tag: noindex, nofollow`. |
| `<casa>.sagradagestao.com.br` | Site público da casa (rewrite para `/site/<casa>`), indexável. `robots.txt` e `/.well-known/*` não são reescritos. |
| `api`, `admin`, `static`, `mail`, `ftp`, `smtp`, `pop`, `imap` (e subdomínio inválido, ex. com ponto) | `404`. Nunca viram site de casa. Mesma lista do back (`RESERVED_SUBDOMAINS` em `functions/src/schemas/house.schemas.ts`) mais `static`. |
| `localhost`, `127.0.0.1` | Como antes: landing em `/` e o sistema nas rotas. |
| Outros hosts (URL do Cloud Run, `*.web.app`) | Como antes, tudo liberado, mas com `noindex` e `robots.txt` bloqueando. |

SEO: a landing e as páginas legais têm canônico e OpenGraph em `https://sagradagestao.com.br`
(mesmo quando abertas no `app`). `sitemap.xml` só existe no raiz (landing + legais).

Os botões "Entrar" e "Criar conta" da landing e das páginas legais apontam para
`NEXT_PUBLIC_APP_URL` (URL absoluta do app).

> A sessão do Firebase Auth é por origem. Quem hoje usa o sistema em
> `sagradagestao.com.br/...` (se for o caso) vai ser mandado para o `app` e terá que
> entrar de novo uma vez.

## Envs de produção (web)

Já estão no `Dockerfile` (as `NEXT_PUBLIC_*` entram no build, não em runtime):

```
NEXT_PUBLIC_BASE_DOMAIN=sagradagestao.com.br
NEXT_PUBLIC_APP_URL=https://app.sagradagestao.com.br
# opcional: NEXT_PUBLIC_SITE_URL=https://sagradagestao.com.br (é o padrão derivado das duas acima)
```

## Back

- `BILLING_WEB_URL=https://app.sagradagestao.com.br` (sem barra no fim). É a base das
  URLs de retorno do Stripe (`/admin/plano/sucesso`, `/admin/plano/cancelado`, portal
  em `/admin/plano`). Se ficar no raiz também funciona (o raiz manda para o app com 308),
  mas com um salto a mais.
- Convites: o back devolve só o path (`/c/<slug>/cadastro?invite=...`) e o web monta o
  link com `window.location.origin`, ou seja, `app.sagradagestao.com.br`. Coerente.
- `updateHouseSiteConfig` registra `<subdomínio>.sagradagestao.com.br` no site
  `sagrada-gestao` do Hosting (API `customDomains`). Coerente: casa continua sendo
  subdomínio do raiz. O DNS desses subdomínios precisa resolver para o Hosting (ver abaixo).
- App mobile: `EXPO_PUBLIC_WEB_URL=https://app.sagradagestao.com.br` e associated
  domains/intent filters em `app.sagradagestao.com.br`. Coerente.

## O que fazer no Firebase Hosting e no registro.br

Ordem pensada para não derrubar o que está no ar: primeiro o `app` fica pronto, depois
o deploy, e só então o raiz passa a mandar gente para o `app`.

1. **Firebase Auth**: Console > Authentication > Settings > Authorized domains. Confirmar
   que `app.sagradagestao.com.br` está na lista (sem isso o login no `app` falha).
   Manter `sagradagestao.com.br` também.
2. **Conectar o `app`** (se ainda não estiver): Console > Hosting > site `sagrada-gestao`
   > Add custom domain > `app.sagradagestao.com.br`. O console mostra os registros
   (TXT de verificação e os A/CNAME de apontamento). Criar exatamente esses registros na
   zona `sagradagestao.com.br` no registro.br (Painel > domínio > DNS > Editar zona).
   Esperar o status ficar **Connected** e o certificado **ativo** (pode levar algumas
   horas). Conferir: `curl -sI https://app.sagradagestao.com.br/login` → 200.
3. **Conectar o raiz e o `www`**: mesmo fluxo para `sagradagestao.com.br` e
   `www.sagradagestao.com.br`. Para o `www`, tanto faz conectar normal (o middleware
   devolve 308) ou usar a opção "Redirect" do próprio Hosting para o raiz. No registro.br,
   o raiz usa registros A (o apex não aceita CNAME); se já existir um A apontando para
   outro lugar, troque pelo que o console pedir (é aqui que o raiz muda de dono).
4. **Casas**: cada casa é um custom domain separado criado pelo `updateHouseSiteConfig`.
   Os registros DNS delas precisam existir (um curinga `*.sagradagestao.com.br` apontando
   para o Hosting, se o registro.br aceitar, ou um registro por casa). Não muda nada
   nesta entrega; só não apagar o curinga/registros ao mexer na zona.
5. **Back**: `BILLING_WEB_URL=https://app.sagradagestao.com.br` em
   `functions/.env.sagrada-gestao` (ou onde estiver o param) e deploy das functions de
   billing.
6. **Deploy do web** (build com as envs acima) no Cloud Run.
7. **Conferir** (as quatro respostas e o `Location`):

   ```bash
   curl -sI https://sagradagestao.com.br/ | head -1                       # 200
   curl -sI https://sagradagestao.com.br/login | grep -i '^location'      # https://app.sagradagestao.com.br/login
   curl -sI https://www.sagradagestao.com.br/termos | grep -i '^location' # https://sagradagestao.com.br/termos
   curl -sI https://app.sagradagestao.com.br/ | grep -i '^location'       # https://app.sagradagestao.com.br/login
   curl -s  https://app.sagradagestao.com.br/.well-known/assetlinks.json  # JSON, 200, sem redirect
   curl -s  https://sagradagestao.com.br/sitemap.xml                      # landing + legais
   ```

   Depois, no Google Search Console, adicionar a propriedade `sagradagestao.com.br` e
   enviar o `sitemap.xml`.

Cache do Hosting: a chave do CDN inclui o host, então o `/` do raiz (landing) e o `/` do
`app` (redirect) não se misturam. Os 308 ficam em cache no navegador de quem acessou;
se precisar desfazer o roteamento, quem já visitou pode continuar sendo redirecionado.

## Testes

- Unitários das regras: `npm test` (`node --test`, arquivo
  `src/lib/domain-routing.test.ts`).
- Ponta a ponta contra um servidor local, simulando o Hosting com `x-fh-requested-host`:

  ```bash
  NEXT_PUBLIC_BASE_DOMAIN=sagradagestao.com.br \
  NEXT_PUBLIC_APP_URL=https://app.sagradagestao.com.br \
  npm run build
  npx next start -p 3900 &
  npm run test:domains          # TARGET=http://localhost:3900 por padrão
  ```

  (Use o `.env.local` com emuladores e projeto `demo-sagrada`: esse teste só faz GET,
  mas não há motivo para o build apontar para produção.)

## Simular os domínios localmente

`localhost:3000` puro continua como antes (landing em `/`, sistema nas rotas).

- **Site de casa**: `http://<casa>.localhost:3000` (Chrome e Firefox resolvem
  `*.localhost` para a máquina sem configurar nada).
- **App**: `http://app.localhost:3000` (`/` vai para o login).
- **Raiz, www, app e casa como em produção**: use `lvh.me`, que resolve qualquer
  subdomínio para `127.0.0.1` (precisa de internet para o DNS):

  ```bash
  NEXT_PUBLIC_BASE_DOMAIN=lvh.me:3000 \
  NEXT_PUBLIC_APP_URL=http://app.lvh.me:3000 \
  npm run dev
  # http://lvh.me:3000          landing; /login vai para http://app.lvh.me:3000/login
  # http://www.lvh.me:3000      vai para http://lvh.me:3000
  # http://app.lvh.me:3000      sistema
  # http://<casa>.lvh.me:3000   site da casa
  ```

  As `NEXT_PUBLIC_*` são lidas quando o servidor sobe: troque e reinicie o `npm run dev`.
  Com emuladores, o Auth emulator não exige domínio autorizado.
- **Sem navegador**: `curl -sI -H 'x-fh-requested-host: sagradagestao.com.br' http://localhost:3900/login`
  contra um build com as envs de produção (ver Testes).
