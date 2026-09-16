FROM node:22-bookworm-slim AS build

WORKDIR /workspace
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/tsconfig.json apps/server/drizzle.config.ts ./apps/server/
RUN pnpm install --frozen-lockfile --filter server...

COPY apps/server/src ./apps/server/src
RUN pnpm --filter server build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/apps/server/node_modules ./apps/server/node_modules
COPY --from=build /workspace/apps/server/dist ./dist
COPY apps/server/package.json ./

USER node
EXPOSE 3000
CMD ["node", "dist/app/api.js"]
