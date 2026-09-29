# syntax=docker/dockerfile:1

# Production image for the Next.js site: a multi-stage build that ships only
# the standalone server bundle (no dev dependencies, no source).
#
#   docker build --build-arg NEXT_PUBLIC_SITE_URL=https://shihy.coaching -t shihy .
#   docker run -p 3000:3000 --env-file .env.production -v shihy-data:/app/.data shihy
#
# Without KV_REST_API_URL / KV_REST_API_TOKEN, applications are stored in
# /app/.data/store.json, so mount a volume there or they are lost on restart.

ARG NODE_VERSION=22

# ---- deps: install exactly what package-lock.json says ----
FROM node:${NODE_VERSION}-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM node:${NODE_VERSION}-slim AS build
WORKDIR /app
# NEXT_PUBLIC_* values are inlined into the client bundle at build time.
ARG NEXT_PUBLIC_SITE_URL=https://shihy.coaching
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_DIST_DIR=.next \
    NEXT_STANDALONE=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- run ----
FROM node:${NODE_VERSION}-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
# Writable home for the file store (used when Upstash isn't configured).
RUN mkdir -p .data && chown node:node .data

USER node
EXPOSE 3000
VOLUME ["/app/.data"]
CMD ["node", "server.js"]
