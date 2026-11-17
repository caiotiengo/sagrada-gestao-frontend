# Universal links / App Links

Origem do conteúdo: `docs/universal-links.md` do app (sg-delete-mobile, `chore/launch`).
Servidos em `https://app.sagradagestao.com.br/.well-known/...` com
`Content-Type: application/json` (headers em `next.config.ts`; o AASA não tem extensão).

Antes de publicar, troque os marcadores (JSON não aceita comentário, por isso o
marcador está dentro do valor):

- `A_CONFIRMAR_TEAM_ID` em `apple-app-site-association`: Team ID da conta Apple
  Developer (developer.apple.com > Membership). Fica `<TEAM_ID>.com.sagradagestao.app`.
- `A_CONFIRMAR_SHA256_DA_CHAVE_DE_ASSINATURA` em `assetlinks.json`: SHA-256 da chave
  de assinatura (`eas credentials -p android`) e, com Play App Signing, também o
  SHA-256 de Play Console > Integridade do app > Assinatura (os dois no array),
  no formato `AA:BB:...`.

O `firebase.json` do Hosting ignora arquivos com ponto (`**/.*`), então estes
arquivos não saem pelo CDN estático: o rewrite manda a requisição para o Cloud Run,
e o Next serve de `public/`. Conferir depois do deploy que responde 200 sem redirect.
