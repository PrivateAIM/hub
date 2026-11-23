# Local Development Setup

## Prerequisites

- **Node.js** ≥26.0.0
- **npm** (ships with Node.js)
- **Docker** and **Docker Compose** (for database services)

## Installation

```bash
# Clone the repository
git clone https://github.com/PrivateAIM/hub.git
cd hub

# Install dependencies
npm ci
```

## Build

```bash
# Build all packages (Nx handles dependency ordering)
npm run build
```

## Start Development Servers

The frontend and the docs site have a `dev` script. The backend services have none: build first
(`npm run build`), then start them through their CLI.

```bash
# Frontend (Nuxt)
npm run dev --workspace=apps/client-ui

# Core API server
npm run cli --workspace=apps/server-core -- start

# Storage and telemetry services
npm run cli --workspace=apps/server-storage -- start
npm run cli --workspace=apps/server-telemetry -- start

# Message broker
npm run cli --workspace=apps/server-messenger -- start

# Worker service
npm run start --workspace=apps/server-core-worker

# Documentation site
npm run dev --workspace=docs
```

Each service listens on port `3000` unless `PORT` is set, so give each one its own port when they
run side by side.

See [Services](/reference/) for per-service details and environment variables.

## Database Setup

Start MySQL and PostgreSQL via Docker Compose:

```bash
docker-compose up -d
```

This starts:
- **MySQL 9** on port `3306`
- **PostgreSQL 18** on port `5432`

## Running Tests

```bash
# All packages
npm run test

# Single package
npx nx test server-core

# Against a running database from `docker-compose up -d`
npm run test:mysql --workspace=apps/server-core
npm run test:psql --workspace=apps/server-core

# With coverage
npm run test:coverage --workspace=apps/server-core
```

Without `DB_TYPE` the database-backed suites start a PostgreSQL testcontainer, and without
`AUTHUP_URL` an Authup testcontainer, so they need a running Docker daemon. Set `DB_TYPE` and the
other `DB_*` variables to use a running database instead (`DB_TYPE=better-sqlite3` with
`DB_DATABASE=:memory:` for SQLite).

### Permission evaluator test imports

`FakePermissionEvaluator`, `EvaluatorBehavior`, `EvaluatorCall` and
`EvaluatorMethodName` come from `@authup/server-test-kit`; `@privateaim/server-test-kit`
does not re-export them. Hub's actor factories (`createAllowAllActor()`,
`createDenyAllActor()`, `createScopedActor()` from `@privateaim/server-test-kit`) expose
an evaluator through `permissionEvaluator`.

```ts
import { FakePermissionEvaluator } from '@authup/server-test-kit';
import type {
    EvaluatorBehavior,
    EvaluatorCall,
    EvaluatorMethodName,
} from '@authup/server-test-kit';
```

## Linting

```bash
# Check
npm run lint

# Auto-fix
npm run lint:fix
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DB_TYPE` | Database driver: `mysql`, `postgres`, `better-sqlite3` |
| `DB_HOST` / `DB_PORT` | Database connection |
| `DB_USERNAME` / `DB_PASSWORD` | Database credentials |
| `DB_DATABASE` | Database name |
| `AUTHUP_URL` | Authup identity provider URL |
| `REDIS_CONNECTION_STRING` | Redis for pub/sub and caching (required by server-messenger) |
| `RABBITMQ_CONNECTION_STRING` | RabbitMQ connection |
| `MINIO_CONNECTION_STRING` | MinIO/S3 storage connection for server-storage; without it files go to `STORAGE_PATH` (default `<cwd>/writable/storage`) |
| `CORE_URL` / `STORAGE_URL` | Required by the worker |

Every variable per service is listed under [Services](/reference/) and in
[Configuration](/guide/deployment/configuration).
