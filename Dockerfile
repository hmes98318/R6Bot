# Use the same pinned Node.js runtime for compilation and production.
FROM node:24.21.0-bookworm-slim AS base
WORKDIR /bot

# Cache development dependencies separately from the TypeScript source.
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# Keep Chromium inside its package so the runtime user can locate it.
FROM base AS runtime
ENV NODE_ENV=production \
    PLAYWRIGHT_BROWSERS_PATH=0

COPY package.json package-lock.json ./

# Install production modules, Chromium, and its required Linux libraries.
RUN npm ci --omit=dev --ignore-scripts \
    && ./node_modules/.bin/playwright install \
        --with-deps chromium --no-shell \
    && npm cache clean --force \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=node:node /bot/dist ./dist
COPY --chown=node:node config.js ./config.js

# Prepare writable log storage before dropping privileges.
RUN mkdir -p /bot/logs && chown node:node /bot/logs

# Application and browser processes run without root privileges.
USER node
ENTRYPOINT ["node", "--enable-source-maps"]
CMD ["dist/run.js"]
