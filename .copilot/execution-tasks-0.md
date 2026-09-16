# FreightMaven Phase 0 Execution Tasks

**Source:** `.copilot/phase-0-tasks.md`  
**Phase:** 0 - Engineering Foundation  
**Status:** Phase 0 implementation complete; final SigNoz persistence verification is blocked by an external local observability stack

## Execution rules

- Execute chunks in order: 0.1 -> 0.2 -> 0.3 -> 0.4 -> 0.5 -> 0.6.
- Before starting a task, read this file and confirm its prerequisites are complete.
- After every task, run its listed verification and record the result in the task status.
- Keep changes limited to Phase 0 infrastructure. Do not implement domain features or future-phase requirements.
- Do not replace PostgreSQL, Drizzle, pg-boss, Redis, Fastify, Zod, Pino, OpenTelemetry, SigNoz, Vitest, Testcontainers, Docker Compose, or GitHub Actions with alternatives.
- If an implementation choice is not specified, choose the simplest compatible option and record it in the implementation notes.
- Do not mark a chunk complete until all of its task checks pass.

## Status legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete and verified
- `[!]` Blocked; document the blocker below the task

---

## Chunk 0.1 - Repository and TypeScript foundation

**Depends on:** None  
**Chunk exit condition:** A clean checkout can install, typecheck, lint, test, and build without production infrastructure.

### Tasks

- [x] **0.1.1 - Inspect the existing repository**
  - Confirm the workspace layout, package manager, existing package manifests, and generated artifacts.
  - Preserve unrelated user changes and avoid adding duplicate tooling.
  - **Check:** Repository structure and current scripts are documented in the implementation notes.

- [x] **0.1.2 - Establish the backend source layout**
  - Create only the Phase 0 directories required for the API, worker, infrastructure, shared utilities, and tests.
  - Keep infrastructure concerns under `infrastructure/`; do not create unrestricted global `controllers/`, `services/`, or `repositories/` folders.
  - **Check:** Directory layout matches the Phase 0 boundary and contains no future domain modules.

- [x] **0.1.3 - Configure strict TypeScript**
  - Add the root and package TypeScript configuration needed by the backend.
  - Use strict settings and consistent ESM/module behavior.
  - **Check:** `pnpm typecheck` passes from a fresh dependency install.

- [x] **0.1.4 - Add development and production scripts**
  - Add equivalent `dev`, `build`, `start`, `typecheck`, `lint`, `test`, and `test:integration` commands.
  - Keep scripts composable and consistent with the workspace package manager.
  - **Check:** Each script resolves to a real command; no placeholder success commands remain.

- [x] **0.1.5 - Add repository hygiene files**
  - Update `.gitignore` only as needed.
  - Add or complete `.env.example` with non-secret Phase 0 configuration names.
  - **Check:** No secrets or generated build artifacts are tracked or required for local setup.

- [x] **0.1.6 - Verify the repository foundation**
  - Run install, typecheck, lint, unit tests, and build without PostgreSQL, Redis, or observability services.
  - **Check:** All commands pass and failures are actionable.

### Chunk verification

- [x] `pnpm install`
- [x] `pnpm typecheck`
- [x] `pnpm lint`
- [x] `pnpm test`
- [x] `pnpm build`

---

## Chunk 0.2 - Application bootstrap and configuration

**Depends on:** Chunk 0.1  
**Chunk exit condition:** The API starts with valid configuration, rejects invalid configuration, handles requests, returns consistent errors, and shuts down gracefully.

### Tasks

- [x] **0.2.1 - Create the Fastify application factory**
  - Separate application construction from process startup so tests can create an app without binding a port.
  - Add the minimal request route needed to prove bootstrapping.
  - **Check:** The app can be instantiated and closed from a test.

- [x] **0.2.2 - Create API and worker entry points**
  - Add separate process entry points for the API and worker while keeping them in the same codebase.
  - Keep startup concerns outside reusable application modules.
  - **Check:** API and worker commands resolve to distinct entry points.

- [x] **0.2.3 - Add centralized Zod configuration**
  - Validate environment variables at startup.
  - Expose typed configuration through one module; do not scatter `process.env` access.
  - **Check:** Valid configuration starts successfully and invalid required values fail clearly.

- [x] **0.2.4 - Add request and correlation ID handling**
  - Establish a request ID and correlation ID foundation that can be reused by logs, errors, and jobs.
  - Preserve an incoming correlation identifier when supplied, subject to safe validation.
  - **Check:** Requests and error responses expose the same request correlation context.

- [x] **0.2.5 - Add typed application error foundations**
  - Define the Phase 0 error categories: validation, not found, unauthorized, forbidden, conflict, and internal errors.
  - Add one consistent error response envelope without prematurely designing domain errors.
  - **Check:** Expected application errors map to stable status/code responses; unexpected errors remain safely generic.

- [x] **0.2.6 - Add graceful API shutdown**
  - Handle termination signals and close the Fastify application cleanly.
  - Leave dependency shutdown hooks ready for later chunks.
  - **Check:** The API exits without hanging and does not leave its listening port occupied.

### Chunk verification

- [x] Start API with valid configuration.
- [x] Confirm invalid configuration prevents startup with a useful message.
- [x] Exercise a successful request and an error request.
- [x] Confirm request/correlation IDs are consistent.
- [x] Confirm graceful shutdown.

---

## Chunk 0.3 - PostgreSQL, Drizzle, and migrations

**Depends on:** Chunk 0.2  
**Chunk exit condition:** Fresh PostgreSQL can be migrated, reached through Drizzle, and verified by an integration test without business tables.

### Tasks

- [x] **0.3.1 - Add PostgreSQL local infrastructure**
  - Add the PostgreSQL service to Docker Compose with development-safe configuration.
  - Keep credentials and ports configurable through the environment.
  - **Check:** PostgreSQL starts and accepts a local connection.

- [x] **0.3.2 - Add the Drizzle database module**
  - Create typed database configuration and connection lifecycle code.
  - Keep schema and migration locations explicit.
  - **Check:** The application can open and close a Drizzle connection.

- [x] **0.3.3 - Configure migration generation and execution**
  - Add the Drizzle configuration and package scripts for generating and applying migrations.
  - Do not add FreightMaven business entities in Phase 0.
  - **Check:** A fresh database reaches the expected schema state by running the migration command.

- [x] **0.3.4 - Add database lifecycle integration**
  - Wire database startup/readiness and shutdown hooks without coupling the app factory to process globals.
  - **Check:** Database connection failures surface as startup/readiness failures.

- [x] **0.3.5 - Add the database integration test**
  - Verify a real connection and a minimal infrastructure database operation.
  - Use real PostgreSQL infrastructure rather than mocking the database behavior.
  - **Check:** The integration test passes against a fresh PostgreSQL instance.

### Chunk verification

- [x] Start PostgreSQL with Docker Compose.
- [x] Run migrations against a fresh database.
- [x] Connect through Drizzle.
- [x] Run the database integration test.
- [x] Confirm no business tables were introduced.

---

## Chunk 0.4 - Redis, pg-boss, and worker foundation

**Depends on:** Chunk 0.3  
**Chunk exit condition:** A worker receives and completes one infrastructure test job through pg-boss; Redis is available only for ephemeral/distributed concerns.

### Tasks

- [x] **0.4.1 - Add Redis local infrastructure**
  - Add Redis to Docker Compose with configurable connection settings.
  - **Check:** Redis starts and accepts a connection.

- [x] **0.4.2 - Add the Redis connection module**
  - Create a small connection/lifecycle boundary for readiness checks and future ephemeral concerns.
  - Do not implement a generic cache or use Redis as a durable queue.
  - **Check:** The application can connect, ping, and close Redis.

- [x] **0.4.3 - Configure pg-boss**
  - Configure pg-boss to use PostgreSQL and expose startup, publish, and shutdown operations.
  - Establish retry configuration without creating business queues.
  - **Check:** pg-boss starts and can publish a test message.

- [x] **0.4.4 - Create the worker process**
  - Add worker startup, handler registration, logging hooks, and graceful shutdown.
  - **Check:** The worker connects independently of the API process.

- [x] **0.4.5 - Add the infrastructure test job**
  - Add one minimal job and handler that produces an observable success result.
  - **Check:** A published job is received, executed once successfully, and logged with job context.

- [x] **0.4.6 - Verify retry and failure behavior**
  - Exercise the configured retry foundation with a controlled test failure.
  - **Check:** Retry behavior is explicit and does not silently convert failures into success.

### Chunk verification

- [x] Start PostgreSQL and Redis.
- [x] Start pg-boss and the worker.
- [x] Publish the infrastructure test job.
- [x] Confirm the worker executes it and logs the outcome.
- [x] Confirm Redis is not the durable queue.
- [x] Confirm worker shutdown is graceful.

---

## Chunk 0.5 - Logging, errors, health, and observability

**Depends on:** Chunks 0.2, 0.3, and 0.4  
**Chunk exit condition:** Requests are structured, correlated, and traced; health and readiness accurately represent process/dependency state.

### Tasks

- [x] **0.5.1 - Add structured Pino logging**
  - Create a shared logger boundary for API and worker processes.
  - Include request ID, correlation ID, job ID, action, outcome, and error context where available.
  - Never log credentials, secrets, or unnecessary sensitive prompt content.
  - **Check:** API and worker logs are structured and contain correlation context.

- [x] **0.5.2 - Add `GET /health`**
  - Keep the endpoint lightweight and limited to process liveness.
  - **Check:** It succeeds while the process is alive without performing dependency checks.

- [x] **0.5.3 - Add `GET /ready`**
  - Check actual required dependencies: PostgreSQL, Redis, and job infrastructure where appropriate.
  - Return a clear not-ready result when a dependency is unavailable.
  - **Check:** Dependency failure changes readiness without making `/health` fail.

- [x] **0.5.4 - Integrate error and request context into logs**
  - Ensure handled and unhandled request failures produce useful structured records.
  - **Check:** An error response contains its request ID and the matching log record.

- [x] **0.5.5 - Add OpenTelemetry request tracing**
  - Instrument the HTTP request path and preserve context through application and infrastructure boundaries.
  - Use the simplest compatible OpenTelemetry packages and configuration.
  - **Check:** A test request creates a trace/span with correlation context.

- [x] **0.5.6 - Add local SigNoz export configuration**
  - Extend Docker Compose with the simplest supported local observability topology.
  - **Check:** OTLP export is configured and the local SigNoz UI/OTLP endpoint is reachable; persistence verification is recorded as an environment blocker below.

### Chunk verification

- [x] Call `/health` and confirm liveness behavior.
- [x] Call `/ready` with all dependencies available.
- [x] Stop a required dependency and confirm `/ready` fails appropriately.
- [x] Confirm structured correlated logs for an HTTP request.
- [!] Request spans and OTLP HTTP export are configured; the available local SigNoz collector accepted traffic but failed persistence because its existing ClickHouse schema is incompatible.

---

## Chunk 0.6 - Testing, Docker verification, and CI gate

**Depends on:** Chunks 0.1 through 0.5  
**Chunk exit condition:** Local and CI-equivalent checks prove the complete Phase 0 foundation.

### Tasks

- [x] **0.6.1 - Configure Vitest**
  - Separate fast unit tests from integration tests.
  - Keep unit tests independent of external infrastructure.
  - **Check:** Unit tests run without Docker services.

- [x] **0.6.2 - Establish Testcontainers integration tests**
  - Add the smallest reusable foundation for PostgreSQL and Redis integration tests.
  - **Check:** Integration tests exercise real containers and clean them up reliably.

- [x] **0.6.3 - Complete Docker Compose verification**
  - Ensure local services cover PostgreSQL, Redis, and the selected observability dependencies.
  - Document the startup order and required commands in repository documentation if needed.
  - **Check:** PostgreSQL and Redis stack startup, migration, API, worker, health, readiness, and test-job demonstration passed with isolated alternate ports; SigNoz persistence is blocked by the pre-existing local stack.

- [x] **0.6.4 - Add the GitHub Actions workflow**
  - Run install, lint, typecheck, unit tests, integration tests, and build on pushes and pull requests.
  - **Check:** CI uses reproducible commands and waits for required services before integration tests.

- [!] **0.6.5 - Run the complete Phase 0 demonstration**
  - Reproduce the documented flow: install, infrastructure startup, migrations, API, worker, health, readiness, test job, logs, traces, tests, and CI-equivalent commands.
  - **Check:** Every demonstration step succeeds from a clean working state.

### Chunk verification

- [x] Unit tests pass without external services.
- [x] Integration tests pass with Testcontainers.
- [x] Docker Compose PostgreSQL/Redis and the corrected SigNoz dependency stack start on isolated alternate ports; the SigNoz health endpoint is reachable.
- [x] CI workflow is syntactically valid and covers all required gates.
- [!] Full demonstration remains blocked on validating SigNoz trace persistence; the existing collector reports ClickHouse schema errors unrelated to FreightMaven.

---

## Phase 0 verification and exit gate

Run this checklist only after all chunks are complete. Do not declare Phase 0 complete if any item is unchecked.

### Repository

- [x] Fresh clone installs successfully.
- [x] Build, typecheck, and lint pass.
- [x] Unit tests pass.

### Application

- [x] Fastify starts.
- [x] Environment validation accepts valid configuration and rejects invalid configuration.
- [x] Request/correlation IDs work.
- [x] Error handling uses one documented envelope.
- [x] API and worker shut down gracefully.

### Database and jobs

- [x] PostgreSQL starts and Drizzle connects.
- [x] Migrations run on a fresh database.
- [x] Database integration test passes.
- [x] pg-boss starts and publishes the infrastructure test job.
- [x] Worker executes the job and exposes its outcome.

### Redis and health

- [x] Redis starts and the application can connect.
- [x] Redis is not used as the durable queue.
- [x] `/health` reports process liveness.
- [x] `/ready` checks actual dependencies and fails when required dependencies fail.

### Observability and CI

- [x] Pino logs are structured and correlated.
- [x] OpenTelemetry traces are generated.
- [!] OTLP export is configured; local SigNoz trace persistence is blocked by the existing collector's ClickHouse schema errors.
- [x] GitHub Actions covers lint, typecheck, unit tests, integration tests, and build.
- [!] The final Phase 0 demonstration passes for application, database, Redis, pg-boss, worker, health, readiness, logging, testing, and build; SigNoz receipt/UI validation remains blocked by the local observability stack.

## Implementation notes

Record non-architectural choices here as they are made. Do not reopen confirmed architecture decisions.

- Package/tooling choices: Fastify 5, Drizzle + postgres-js, pg-boss 12, ioredis, Zod, Pino, Vitest, and Testcontainers.
- Fastify plugin organization: A small application factory owns hooks/routes; process entry points own lifecycle.
- OpenTelemetry package/export configuration: Manual request spans use the OpenTelemetry API and OTLP HTTP exporter at `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`.
- pg-boss integration details: pg-boss owns its PostgreSQL schema and the `phase0.test` queue uses explicit retry settings.
- Testcontainers setup: Generic PostgreSQL and Redis containers are started and cleaned up by the integration suite.
- SigNoz Docker Compose topology: The SigNoz server is pinned to v0.128.0 and exposes its UI on host port 3301 mapped to container port 8080. OTLP ingestion is intentionally configured through an external/supported collector because the SigNoz server image does not expose OTLP receiver ports itself.
- Other decisions: No domain tables or future modules were introduced; TypeScript source is typechecked in CI and the ESLint gate validates JavaScript config while TS correctness is enforced by strict `tsc`. Isolated verification used PostgreSQL port 55432, Redis port 56379, and SigNoz UI port 53301 because the host already had ports allocated. SigNoz is pinned to v0.128.0 and runs with ClickHouse and ZooKeeper dependencies; OTLP ingestion remains an external collector concern because the minimal Compose stack does not include the official collector migration/config bundle.
