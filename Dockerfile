FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAt-_oOWvgvEpnPxoVyxDzMmXhS5O7eMjk
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sagrada-gestao.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=sagrada-gestao
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sagrada-gestao.firebasestorage.app
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=85632114725
ENV NEXT_PUBLIC_FIREBASE_APP_ID=1:85632114725:web:75bccddefdb5fc58979fcc
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-Y8V7WVSH0M
ENV NEXT_PUBLIC_USE_EMULATORS=false
ENV NEXT_PUBLIC_APP_URL=https://app.sagradagestao.com.br
ENV NEXT_PUBLIC_BASE_DOMAIN=sagradagestao.com.br

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
