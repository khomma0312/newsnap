# ================================================================
# ビルドコンテキスト: backend/ ディレクトリ
#   docker build -f docker/Dockerfile .
# ================================================================

# ===== base =====
FROM node:24.16.0-slim as node
FROM ubuntu:noble-20260410 as base

# new way to get node, let's copy in the specific version we want from a docker image
# this avoids depdency package installs (python3) that the deb package requires
COPY --from=node /usr/local/include/ /usr/local/include/
COPY --from=node /usr/local/lib/ /usr/local/lib/
COPY --from=node /usr/local/bin/ /usr/local/bin/

RUN apt-get update \
    && apt-get -qq install -y --no-install-recommends \
    tini \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1001 node \
    && useradd --uid 1001 --gid node --shell /bin/bash --create-home node \
    && mkdir /app \
    && chown -R node:node /app

WORKDIR /app
USER node
ENV NODE_ENV=production
EXPOSE 3001

COPY --chown=node:node package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force

# ===== build =====
FROM base AS build
COPY --chown=node:node . /app
# ビルドに必要なdevDependenciesもインストール & ビルド実行
RUN npm ci && npm run build

# ===== dev =====
FROM base AS dev

ENV NODE_ENV=development
RUN npm install --only=development
COPY --chown=node:node . /app
CMD ["npm", "run", "dev"]

# ===== prod ======
FROM base AS prod
COPY --chown=node:node --from=build /app/dist ./dist
# PID 1のプロセスが終了したときに子プロセスも確実に終了するようにtiniを使用して起動
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/index.js"]