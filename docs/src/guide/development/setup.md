# Local Development Setup

## Prerequisites

- **Node.js** 22+
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

```bash
# Frontend (Nuxt)
npm run dev --workspace=apps/client-ui

# Core API server
npm run dev --workspace=apps/server-core

# Realtime / WebSocket server
npm run dev --workspace=apps/server-messenger

# Worker service
npm run dev --workspace=apps/server-core-worker

# Documentation site
npm run dev --workspace=docs
```

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
# All packages (uses SQLite by default)
npm run test

# Specific database backend
npm run test:mysql
npm run test:psql

# With coverage
npm run test:coverage

# Single package
npx nx test server-core
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
| `REDIS_CONNECTION_STRING` | Redis for pub/sub and caching |
| `RABBITMQ_CONNECTION_STRING` | RabbitMQ connection |
| `MINIO_CONNECTION_STRING` | MinIO/S3 storage connection |
