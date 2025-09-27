# syntax=docker/dockerfile:1

FROM oven/bun:1 AS runner
WORKDIR /app

# Install dependencies first (leverages Docker layer cache)
COPY package.json bun.lock tsconfig.json ./
RUN bun install --ci --no-progress

# Copy application source
COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.ts ./drizzle.config.ts

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]


