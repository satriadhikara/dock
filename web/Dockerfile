# syntax=docker/dockerfile:1

############################
# Base image (glibc, stable)
############################
FROM node:20-bookworm-slim AS base
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    # optional: more reproducible installs
    npm_config_fund=false npm_config_audit=false

WORKDIR /app
# Small but useful certs; keep image tiny
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

############################
# Deps layer
############################
FROM base AS deps
# If you use private registries, copy your .npmrc too
COPY package.json package-lock.json ./
RUN npm ci --include=dev

############################
# Build layer
############################
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of your app source
COPY . .
# Optional but nice: preinstall the correct SWC so Next won't patch mid-build
# RUN npm i -D @next/swc-linux-x64-gnu@15.5.4
RUN npm run build

############################
# Runtime layer (tiny, secure)
############################
FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
WORKDIR /app

# Copy only what the standalone server needs
COPY --from=builder /app/.next/standalone ./        # server.js + node_modules subset
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Security hardening
USER node
EXPOSE 3000
CMD ["node", "server.js"]
