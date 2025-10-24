FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat && npm install -g pnpm@8
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY apps ./apps
COPY services ./services
COPY scripts ./scripts
RUN pnpm install --frozen-lockfile

FROM base AS build
ARG PACKAGE
RUN pnpm --filter ${PACKAGE} build

FROM node:18-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat && npm install -g pnpm@8
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=base /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=base /app/apps ./apps
COPY --from=base /app/services ./services
COPY --from=base /app/scripts ./scripts
COPY --from=build /app/apps ./apps
COPY --from=build /app/services ./services
ARG PACKAGE
CMD ["pnpm", "--filter", "${PACKAGE}", "start:prod"]
