# ── Etapa 1: Dependencias ────────────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiamos solo los archivos de dependencias para aprovechar el cache de Docker
COPY package.json package-lock.json* ./

RUN npm ci --legacy-peer-deps


# ── Etapa 2: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos las dependencias ya instaladas
COPY --from=deps /app/node_modules ./node_modules

# Copiamos el resto del código
COPY . .

# Variables de entorno necesarias en BUILD TIME
# Las NEXT_PUBLIC_* deben estar presentes al momento de buildear
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CV_URL

ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CV_URL=$NEXT_PUBLIC_CV_URL

# Deshabilitamos telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Buildeamos la app en modo standalone (genera una carpeta .next/standalone)
RUN npm run build


# ── Etapa 3: Runner (imagen final liviana) ───────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos los archivos públicos estáticos
COPY --from=builder /app/public ./public

# Copiamos el output standalone de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Arrancamos con el servidor standalone de Next.js
CMD ["node", "server.js"]