# FreightMaven

## Phase 0, Engineering Foundation

**Project:** FreightMaven
**Phase:** 0
**Goal:** Establish a bootable, reproducible, testable and observable backend foundation before implementing freight business behavior.

---

# 1. Phase Objective

Phase 0 prepares the backend for all later FreightMaven development.

At the end of Phase 0:

```text
Fresh Clone
    ↓
Install Dependencies
    ↓
Start Docker Infrastructure
    ↓
Run Database Migrations
    ↓
Start API
    ↓
Start Worker
    ↓
Worker Executes Test Job
    ↓
Health / Readiness Checks Pass
    ↓
Logs + Traces Are Available
    ↓
Tests Pass
    ↓
CI Passes
```

No freight business functionality is implemented in this phase.

---

# 2. Architecture Confirmed for Phase 0

FreightMaven is a **modular monolith** with separate API and worker processes using the same codebase.

### Confirmed technologies

| Concern                      | Technology              |
| ---------------------------- | ----------------------- |
| Runtime                      | Node.js + TypeScript    |
| HTTP                         | Fastify                 |
| Database                     | PostgreSQL              |
| ORM                          | Drizzle ORM             |
| Durable jobs                 | pg-boss                 |
| Cache / distributed concerns | Redis                   |
| Validation                   | Zod                     |
| Logging                      | Pino                    |
| Tracing / metrics            | OpenTelemetry + SigNoz  |
| Testing                      | Vitest + Testcontainers |
| Containers                   | Docker Compose          |
| CI                           | GitHub Actions          |

These are taken from the FreightMaven Development Specification v2.

### Important architecture rule

Do **not** introduce:

```text
MongoDB
BullMQ
Kafka
Microservices
Kubernetes
Service mesh
CQRS
Event sourcing
```

during Phase 0.

## The general backend readiness document mentions MongoDB and BullMQ, but FreightMaven v2 explicitly selects PostgreSQL, Drizzle and pg-boss instead.

# 3. What Phase 0 Must NOT Build

Do not implement:

* Authentication
* Users
* Organizations
* Memberships
* RBAC
* Customers
* Carriers
* Shipments
* Quotes
* Negotiation
* Booking
* Documents
* Tracking
* AI agents
* LangGraph workflows
* RAG
* pgvector
* Carrier simulator
* Business domain state machines

Those belong to later phases.

Phase 0 is infrastructure only.

---

# 4. Repository Direction

Use a modular-monolith structure.

```text
src/
├── app/
├── api/
├── infrastructure/
│   ├── db/
│   ├── redis/
│   ├── jobs/
│   ├── observability/
│   └── ...
├── workers/
├── shared/
│   ├── errors/
│   ├── validation/
│   ├── types/
│   ├── security/
│   └── utils/
└── modules/

tests/
├── unit/
├── integration/
├── contract/
├── agents/
└── evals/
```

Do not create every future module just because it appears in the architecture document.

Only create directories required by the current Phase 0 implementation.

Avoid:

```text
controllers/
services/
repositories/
```

as unrestricted global folders.

Domain modules will own their own logic when Phase 1+ begins.

---

# 5. Phase 0 Chunks

## Chunk 0.1, Repository & TypeScript Foundation

### Objective

Make the repository a clean TypeScript backend project with reliable development and production scripts.

### Implement

* Node.js runtime configuration
* TypeScript configuration
* Strict TypeScript settings
* Package scripts
* Development server script
* Production build script
* Typecheck script
* Test script
* Lint script
* Consistent module configuration
* Basic `.gitignore`
* Environment example file
* Initial source/test directory structure

### Expected commands

The exact package scripts may be chosen based on the existing repository, but the project should support equivalent operations for:

```text
dev
build
start
typecheck
lint
test
test:integration
```

Do not introduce unnecessary tooling.

### Acceptance

A fresh checkout can:

```text
install dependencies
→ typecheck
→ lint
→ run tests
→ build
```

without requiring production infrastructure.

---

# 6. Chunk 0.2, Application Bootstrap & Configuration

## Objective

Create the Fastify application lifecycle and centralized configuration.

### Implement

* Fastify application factory
* Application entry point
* Graceful shutdown
* Environment configuration module
* Zod environment validation
* Centralized application configuration
* Basic request handling
* Request ID / correlation ID foundation
* Consistent error handling
* Consistent error response envelope

### Configuration principle

Environment variables must be validated when the application starts.

Invalid configuration should cause startup failure.

Do not scatter:

```text
process.env.X
```

throughout the application.

Use a centralized configuration boundary.

### Error architecture

Create typed application/domain error foundations.

At minimum support concepts such as:

```text
ValidationError
NotFoundError
UnauthorizedError
ForbiddenError
ConflictError
InternalError
```

Do not build complete domain-specific errors yet.

### Acceptance

The application:

```text
starts successfully with valid configuration
fails clearly with invalid configuration
handles an HTTP request
returns consistent errors
shuts down gracefully
```

---

# 7. Chunk 0.3, PostgreSQL, Drizzle & Migrations

## Objective

Establish PostgreSQL as the durable business database and Drizzle as the database access/schema layer.

### Implement

* PostgreSQL Docker service
* PostgreSQL connection configuration
* Drizzle setup
* Database client
* Schema directory
* Migration configuration
* Migration generation workflow
* Migration execution workflow
* Database connection lifecycle
* Basic database integration test

### Important

Do not create FreightMaven business tables yet.

Phase 1 will define:

```text
organizations
users
memberships
roles
refresh_sessions
```

Phase 2+ will define freight domain tables.

Phase 0 should prove that the database infrastructure works without prematurely designing those entities.

### Migration test

The phase must demonstrate:

```text
Fresh PostgreSQL
    ↓
Run migrations
    ↓
Database reaches expected schema state
    ↓
Application can connect
```

### Acceptance

A fresh developer environment can:

```text
start PostgreSQL
→ run migrations
→ connect through Drizzle
→ execute a test database operation
→ run integration test
```

---

# 8. Chunk 0.4, Redis, pg-boss & Worker Foundation

## Objective

Establish the two asynchronous infrastructure responsibilities correctly.

### PostgreSQL / pg-boss

pg-boss is the durable job system.

Use it for:

```text
durable jobs
retries
scheduled jobs
workers
background processing
```

### Redis

Redis is NOT the durable job queue.

Redis is reserved for explicitly defined ephemeral/distributed concerns such as:

```text
cache
rate limiting
Socket.IO fan-out later
selected distributed locks
```

Do not build a generic caching system in Phase 0.

### Implement

* Redis Docker service
* Redis connection module
* pg-boss configuration
* Worker process
* Test queue/job
* Job handler
* Retry configuration foundation
* Graceful worker shutdown
* Job logging

### Test job

Create one minimal infrastructure test job.

Example conceptual flow:

```text
API / development trigger
       ↓
pg-boss
       ↓
Worker
       ↓
Test Job Handler
       ↓
Success Log
```

This is an infrastructure verification job, not a FreightMaven business job.

### Acceptance

The phase must demonstrate:

```text
pg-boss starts
→ worker connects
→ test job is published
→ worker receives it
→ worker executes it
→ result is observable
```

A job dashboard may be added only if it is simple and useful for local inspection. Do not build custom job-management UI.

---

# 9. Chunk 0.5, Logging, Errors, Health & Observability

## Objective

Make the application observable before business functionality is added.

The FreightMaven specification explicitly requires observability from the beginning.

### Logging

Use Pino.

Logs should support useful correlation information such as:

```text
request ID
correlation ID
job ID
action
outcome
error
```

Do not log secrets.

Do not log credentials or unnecessary sensitive prompt content.

### Health endpoint

Create:

```text
GET /health
```

Purpose:

```text
Is the application process alive?
```

It should remain lightweight.

### Readiness endpoint

Create:

```text
GET /ready
```

Readiness should verify actual required dependencies.

At minimum:

```text
PostgreSQL
Redis
pg-boss / job infrastructure where appropriate
```

Do not make `/health` perform expensive dependency checks.

### Error response

Create one consistent API error structure.

The exact response shape should be simple and documented.

Example concept:

```json
{
  "error": {
    "code": "SOME_ERROR",
    "message": "Human readable message",
    "requestId": "..."
  }
}
```

The exact field names are not yet contractually fixed unless the existing repository already defines them.

Do not invent a complex error framework.

### OpenTelemetry

Implement the foundation for:

```text
HTTP request
    ↓
application
    ↓
database / infrastructure
```

tracing.

Configure local export to SigNoz according to the chosen local setup.

### SigNoz

The Phase 0 environment must make it possible to inspect application traces locally.

The goal is not to build dashboards for every future metric.

At this stage prove:

```text
HTTP request
    ↓
trace generated
    ↓
trace exported
    ↓
trace visible in local observability system
```

### Acceptance

A test HTTP request must be:

```text
logged
correlated
traced
```

and the trace must be inspectable in the local observability stack.

---

# 10. Chunk 0.6, Testing, Docker Verification & CI Gate

## Objective

Make the foundation reproducible and continuously verifiable.

### Vitest

Set up:

```text
unit tests
integration tests
```

Unit tests should not require external infrastructure.

Integration tests should use real infrastructure where infrastructure behavior matters.

The FreightMaven specification explicitly selects Testcontainers for integration testing.

### Testcontainers

Establish the foundation for integration tests involving:

```text
PostgreSQL
Redis
```

Use containers rather than mocking infrastructure behavior.

Do not create a huge test framework.

### Docker Compose

Provide local infrastructure for the development environment.

At minimum Phase 0 should establish the required local services for:

```text
PostgreSQL
Redis
observability dependencies
```

The exact SigNoz dependency setup should follow the simplest supported local configuration.

### GitHub Actions

CI pipeline:

```text
Push / Pull Request
        ↓
Install
        ↓
Lint
        ↓
Typecheck
        ↓
Unit Tests
        ↓
Integration Tests
        ↓
Build
```

Security scanning may be added only if it can be integrated without complicating the initial pipeline.

The source specification requires the CI foundation to cover lint, typecheck, unit, integration and build.

---

# 11. Phase 0 Dependency Order

Copilot must execute chunks in this order:

```text
0.1 Repository
      ↓
0.2 Application + Config
      ↓
0.3 PostgreSQL + Drizzle
      ↓
0.4 Redis + pg-boss + Worker
      ↓
0.5 Logging + Errors + Health + Observability
      ↓
0.6 Testing + Docker + CI
```

A later chunk may depend on an earlier chunk, but should not redesign it unnecessarily.

---

# 12. Decisions That Are Already Confirmed

These should NOT be reopened by Copilot:

### Architecture

```text
Modular monolith
Separate API and worker processes
Same codebase
```

### Database

```text
PostgreSQL
Drizzle ORM
```

### Jobs

```text
pg-boss
```

### Redis

```text
Cache
Rate limiting
Realtime infrastructure later
Selected distributed locks
```

Redis is not the durable job queue.

### API framework

```text
Fastify
```

### Validation

```text
Zod
```

### Logging

```text
Pino
```

### Observability

```text
OpenTelemetry + SigNoz
```

### Testing

```text
Vitest
Testcontainers
```

### Local infrastructure

```text
Docker Compose
```

### CI

```text
GitHub Actions
```

These are supported directly by the FreightMaven specification.

---

# 13. Decisions Not Fully Confirmed Yet

Do not silently invent these.

## 13.1 REST vs tRPC

The FreightMaven specification says:

```text
Choose REST or tRPC.
Use one consistently.
REST is recommended for external integrations.
```

REST is recommended, but the document does not state that it is an absolute locked decision.

**Decision required before API contracts become substantial.**

For Phase 0, keep the API layer minimal so this decision does not block infrastructure work.

---

## 13.2 Exact package/tooling choices

The architecture specifies technologies, but does not prescribe every supporting package.

Examples:

```text
dotenv vs another config loader
Fastify plugin organization
exact OpenTelemetry packages
exact pg-boss integration structure
exact Testcontainers modules
```

Use the simplest mature choice compatible with the confirmed architecture.

Do not introduce libraries merely because they are popular.

---

## 13.3 SigNoz local deployment shape

The specification requires OpenTelemetry + SigNoz but does not fully define the exact Docker Compose topology.

Choose the simplest maintainable local setup.

Do not create custom observability infrastructure.

---

# 14. Rules for Copilot

Copilot should treat this document as the implementation boundary for Phase 0.

### Rule 1

Do not implement future phases.

### Rule 2

Do not change confirmed architecture.

### Rule 3

Do not resolve explicitly unresolved decisions by silently inventing requirements.

### Rule 4

When an implementation choice is necessary but not specified, choose the simplest reasonable option and record it as an implementation detail.

### Rule 5

When a choice changes architecture, dependencies, security model, data model or future phase behavior, stop and ask for confirmation.

### Rule 6

Do not over-engineer.

Avoid introducing:

```text
microservices
Kafka
CQRS
event sourcing
Kubernetes
service mesh
custom frameworks
generic enterprise abstractions
premature caching
premature domain models
```

### Rule 7

Every chunk must finish with its own verification.

### Rule 8

Do not declare Phase 0 complete merely because the code compiles.

The phase gate requires working infrastructure and evidence.

---

# 15. Phase 0 Exit Gate

Phase 0 is complete only when all of the following are true.

## Repository

* [ ] Fresh clone installs successfully
* [ ] TypeScript builds
* [ ] Typecheck passes
* [ ] Lint passes

## Application

* [ ] Fastify starts
* [ ] Graceful shutdown works
* [ ] Environment validation works
* [ ] Error handling works
* [ ] Request IDs/correlation IDs work

## Database

* [ ] PostgreSQL starts
* [ ] Drizzle connects
* [ ] Migrations run successfully
* [ ] Database integration test passes

## Jobs

* [ ] pg-boss starts
* [ ] Worker starts
* [ ] Test job can be published
* [ ] Worker executes test job
* [ ] Job execution is observable

## Redis

* [ ] Redis starts
* [ ] Application can connect
* [ ] Redis is not used as the durable queue

## Health

* [ ] `/health` works
* [ ] `/ready` checks actual dependencies
* [ ] Dependency failure causes readiness failure

## Observability

* [ ] Structured Pino logs work
* [ ] Request correlation works
* [ ] OpenTelemetry tracing works
* [ ] Local traces reach SigNoz

## Testing

* [ ] Vitest works
* [ ] Unit tests work
* [ ] Testcontainers foundation works
* [ ] Integration tests work

## CI

* [ ] GitHub Actions runs
* [ ] Lint passes
* [ ] Typecheck passes
* [ ] Unit tests pass
* [ ] Integration tests pass
* [ ] Build passes

---

# 16. Final Phase 0 Demonstration

The final demonstration should show:

```text
Fresh clone
    ↓
Install dependencies
    ↓
Start Docker Compose
    ↓
PostgreSQL + Redis + observability available
    ↓
Run migrations
    ↓
Start API
    ↓
Start worker
    ↓
Call /health
    ↓
Call /ready
    ↓
Trigger test pg-boss job
    ↓
Worker executes job
    ↓
Pino records execution
    ↓
HTTP request has correlation ID
    ↓
OpenTelemetry trace appears
    ↓
Trace visible in SigNoz
    ↓
Run complete test suite
    ↓
Run CI-equivalent commands
    ↓
All pass
```

Only after this gate passes should FreightMaven move to **Phase 1, Identity, Tenancy & Security**.

---

# 17. Coordinator Instruction

The implementation workflow for this project is:

```text
Phase Plan
    ↓
Copilot Task Breakdown
    ↓
One Chunk
    ↓
Implementation
    ↓
Verification
    ↓
Review
    ↓
Next Chunk
    ↓
Phase Gate
    ↓
Next Phase
```

Do not create one giant Phase 0 task.

Copilot should first convert this Phase 0 plan into a task file with:

```text
Chunk 0.1
  tasks

Chunk 0.2
  tasks

Chunk 0.3
  tasks

Chunk 0.4
  tasks

Chunk 0.5
  tasks

Chunk 0.6
  tasks

Phase 0 verification
  tasks
```

Each task should be small enough to implement and verify independently.

The task file must not introduce requirements that are absent from this plan.

---

# 18. Coordinator Status

**Phase 0:** Planned
**Phase 0 implementation:** Not started
**Current priority:** Repository and engineering foundation
**Next action:** Give this Phase 0 plan to Copilot and have Copilot generate the Phase 0 task file.
**Do not execute implementation yet.**
