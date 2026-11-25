# syntax=docker/dockerfile:1
# Prisma usa o engine debian-openssl-3.0.x (binaryTargets = native), por isso bookworm-slim e nao alpine.
ARG NODE_IMAGE=node:22.23.4-bookworm-slim

FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    LEFTHOOK=0 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM base AS build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec prisma generate && pnpm run build

FROM base AS prod-deps
COPY prisma ./prisma
RUN pnpm install --prod --frozen-lockfile \
  && pnpm exec prisma generate

FROM ${NODE_IMAGE}
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production \
    NODE_USE_ENV_PROXY=1 \
    PORT=3000 \
    SWAGGER_DOCS_PATH=/tmp/swagger
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node prisma ./prisma
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
