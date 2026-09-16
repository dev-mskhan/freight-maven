# FreightMaven

FreightMaven Phase 0 is a minimal TypeScript modular-monolith foundation. It
contains an HTTP API and an independent pg-boss worker; no freight domain
features are included.

## Local setup

Requirements: Node.js 22+, pnpm 11+, and Docker (Docker Desktop on Windows).

```sh
pnpm install
Copy-Item .env.example .env # PowerShell; use cp on Unix
docker compose up -d
pnpm --filter server db:migrate
pnpm dev
pnpm --filter server dev:worker
```

The API listens on `http://localhost:3000`. `GET /health` is a lightweight
liveness check, while `GET /ready` checks PostgreSQL, Redis, and pg-boss.
`POST /phase0/test-job` publishes the infrastructure verification job (send
`Content-Type: application/json`, even with an empty `{}` body).
SigNoz is available at `http://localhost:3301`. The OTLP endpoint is
configurable through `OTEL_EXPORTER_OTLP_ENDPOINT`; point it at a supported
SigNoz collector (for example, `http://localhost:4318`) when running the
collector separately. The SigNoz server itself listens on container port
8080, which is mapped to host port 3301 here.

## Verification

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration # requires Docker
pnpm build
```

The integration suite starts disposable PostgreSQL and Redis containers with
Testcontainers. pg-boss stores durable jobs in PostgreSQL; Redis is reserved
for ephemeral infrastructure and is not used as a queue.

Configuration is centralized in `apps/server/src/config.ts`; copy `.env.example`
to `.env` and change values as needed. API errors use:

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Human readable message",
    "requestId": "correlation-id"
  }
}
```
