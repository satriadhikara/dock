# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

# Optional but often helps native deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies for THIS platform (linux/arm64/musl)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Build with those deps
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runtime
FROM base AS runner
WORKDIR /app
ENV PORT=3000
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
# If you rely on Next standalone output, copy it instead of all node_modules
# Otherwise keep node_modules:
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]
