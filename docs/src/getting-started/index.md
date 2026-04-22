# Getting Started

PrivateAIM Hub is the central services platform of the **PrivateAIM** project — a privacy-preserving analytics infrastructure for federated data analysis across distributed institutions.

## What is PrivateAIM Hub?

Hub provides the backend services and frontend application that coordinate federated analyses:

| Service | Purpose |
|---------|---------|
| **Core API** (`server-core`) | Main REST API — manages analyses, projects, nodes, and registries |
| **Worker** (`server-core-worker`) | Background worker — executes Docker containers for analysis tasks |
| **Storage** (`server-storage`) | File/object storage backed by MinIO/S3 |
| **Telemetry** (`server-telemetry`) | Log aggregation via VictoriaLogs |
| **Messenger** (`server-messenger`) | Real-time messaging via Socket.io |
| **Frontend** (`client-ui`) | Nuxt 4 SSR web application |

## Technology Stack

- **Language**: TypeScript (all packages)
- **Runtime**: Node.js 22
- **Package Manager**: npm (workspaces)
- **Build Orchestration**: Nx 22
- **Database**: MySQL, PostgreSQL, or SQLite (via TypeORM)
- **Authentication**: Authup (OAuth2 identity provider)
- **Messaging**: RabbitMQ (AMQP)
- **Caching**: Redis

## Next Steps

- [Architecture](/getting-started/architecture) — understand the system design
- [Local Setup](/guide/development/setup) — get a local development environment running
- [Repository Structure](/guide/development/repository-structure) — explore the monorepo layout
