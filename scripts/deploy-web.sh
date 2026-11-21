#!/usr/bin/env bash
# Deploy do web de PRODUÇÃO (sagrada-gestao): Cloud Run `sagrada-gestao-frontend`
# (southamerica-east1) e depois o Firebase Hosting, que reescreve tudo para o Cloud Run.
#
# Como foi publicado até hoje (histórico do terminal do Caio): `gcloud run deploy --source .`,
# que manda o código para o Cloud Build, builda com o Dockerfile e publica a revisão nova.
# As NEXT_PUBLIC_* de produção estão no Dockerfile (entram no build, não em runtime);
# o .env.local NÃO vai junto (.dockerignore e .gitignore).
#
# Uso (da raiz do repo, no branch que vai para produção):
#   scripts/deploy-web.sh            # só confere e mostra o que faria
#   scripts/deploy-web.sh --yes      # publica (Cloud Run + Hosting)
#   scripts/deploy-web.sh --yes --skip-hosting   # só o Cloud Run
#
# Pré-requisitos: `gcloud auth login` válido (conta com permissão no projeto) e
# `npx firebase login` válido. Rollback: ver ~/Documents/SagradaGestao-QA/DEPLOY-HOJE.md.
set -euo pipefail

PROJECT=sagrada-gestao
SERVICE=sagrada-gestao-frontend
REGION=southamerica-east1
YES=0; SKIP_HOSTING=0
for a in "$@"; do
  case "$a" in
    --yes) YES=1 ;;
    --skip-hosting) SKIP_HOSTING=1 ;;
    *) echo "argumento desconhecido: $a" >&2; exit 2 ;;
  esac
done

cd "$(dirname "$0")/.."

# gcloud nesta máquina precisa de um Python compatível
if [ -z "${CLOUDSDK_PYTHON:-}" ] && [ -x /opt/homebrew/bin/python3.12 ]; then
  export CLOUDSDK_PYTHON=/opt/homebrew/bin/python3.12
fi

fail() { echo "ERRO: $*" >&2; exit 1; }

# 1. Conferências (nada aqui escreve em produção)
grep -q '^ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=sagrada-gestao$' Dockerfile || fail "Dockerfile sem o projectId de produção"
grep -q '^ENV NEXT_PUBLIC_USE_EMULATORS=false$' Dockerfile || fail "Dockerfile com emulador ligado"
grep -q '^ENV NEXT_PUBLIC_APP_URL=https://app.sagradagestao.com.br$' Dockerfile || fail "NEXT_PUBLIC_APP_URL errado no Dockerfile"
grep -q '^ENV NEXT_PUBLIC_BASE_DOMAIN=sagradagestao.com.br$' Dockerfile || fail "NEXT_PUBLIC_BASE_DOMAIN errado no Dockerfile"
grep -q '^ENV NEXT_PUBLIC_FUNCTIONS_REGION=us-central1$' Dockerfile || fail "NEXT_PUBLIC_FUNCTIONS_REGION deve ser us-central1 (callables ao lado do Firestore)"
grep -q '^\.env\.local$' .dockerignore || fail ".dockerignore não exclui .env.local"
grep -q '"serviceId": "sagrada-gestao-frontend"' firebase.json || fail "firebase.json não reescreve para o Cloud Run"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
SHA=$(git rev-parse --short HEAD)
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  fail "há mudanças não commitadas; o deploy sobe o diretório como está"
fi
echo "Branch: $BRANCH ($SHA)"
echo "Testes das regras de domínio:"
npm test --silent >/dev/null && echo "  ok" || fail "npm test falhou"

gcloud auth print-access-token >/dev/null 2>&1 || fail "gcloud sem login válido: rode 'gcloud auth login' (interativo)"

echo
echo "Revisão no ar agora (anote para o rollback):"
gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT" \
  --format='value(status.traffic[0].revisionName,status.url)' || true

# Desempenho (21/11/2026): com min 0 cada instância nova levava 2-4 s para
# responder (cold start) em tudo que o CDN não tem: /login logo após deploy,
# /_next/image, RSC, /site/*, /c/*. Uma instância sempre pronta + CPU extra na
# partida. Custo estimado da instância ociosa (1 vCPU, 512 MiB, Tier 2):
# ~US$ 14/mês. Fica aqui para o próximo deploy não desfazer.
CMD_RUN=(gcloud run deploy "$SERVICE" --source . --region "$REGION" --project "$PROJECT" --allow-unauthenticated
  --min-instances 1 --cpu-boost
  --update-labels "git-sha=$SHA")
CMD_HOSTING=(npx firebase deploy --only hosting --project "$PROJECT" -m "web $BRANCH $SHA")

echo
echo "Comandos:"
echo "  ${CMD_RUN[*]}"
[ "$SKIP_HOSTING" = 1 ] || echo "  ${CMD_HOSTING[*]}"
if [ "$YES" != 1 ]; then
  echo
  echo "Nada foi publicado. Rode com --yes para publicar."
  exit 0
fi

# 2. Cloud Run (Cloud Build com o Dockerfile; 100% do tráfego na revisão nova ao terminar)
"${CMD_RUN[@]}"

# 3. Hosting (reescrita para o Cloud Run + arquivos de public/)
if [ "$SKIP_HOSTING" != 1 ]; then
  "${CMD_HOSTING[@]}"
fi

# 4. Fumaça
echo
for u in https://app.sagradagestao.com.br/login https://sagrada-gestao.web.app/login; do
  printf '%s -> ' "$u"; curl -s -o /dev/null -w '%{http_code}\n' "$u" || true
done
echo "Pronto. Conferências completas no DEPLOY-HOJE.md."
