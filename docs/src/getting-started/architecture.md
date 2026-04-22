# Architecture

## System Overview

![Architecture](/images/architecture.png)

**External services:** Authup (OAuth2), Redis (pub/sub + caching), MySQL/PostgreSQL

## Hexagonal Architecture

All services follow a **hexagonal (ports & adapters)** architecture with three layers:

```
src/
├── core/          # Domain logic — ports, services, validators
├── adapters/      # External system implementations — database, HTTP, socket
└── app/           # Orchestration — DI modules, wiring, factory
```

### Core Layer

Pure business logic with no infrastructure imports. Contains:

- **Entity services** — own validation, receive repositories via constructor injection
- **Port interfaces** — `IXRepository`, `IXService` abstractions
- **Business services** — orchestrate workflows across multiple entities
- **Validators** — input validation using Zod schemas

### Adapter Layer

Implementations that connect domain logic to external systems:

- **Database** — TypeORM entity definitions, subscribers, migrations
- **HTTP** — thin controllers that extract requests, delegate to services, and send responses
- **Socket** — WebSocket handlers

### App Layer

DI modules, wiring, and infrastructure services:

- **Modules** — each implements `IModule` from orkos (config, database, HTTP, etc.)
- **Builder** — fluent API for assembling the application
- **Factory** — `createApplication()` entry point

## Authentication

All services integrate with **Authup** (OAuth2 identity provider):

- Token validation via `@authup/server-adapter` middleware
- Per-realm permission checks via `@authup/access`
- Two-phase permission model: `preCheck` (fast fail) then `check` (with policy attributes)

## Domain Events & Messaging

TypeORM subscribers publish domain events via Redis pub/sub and AMQP (RabbitMQ). AMQP consumers are wired through DI modules:

- **Aggregators** — react to events from other services
- **Components** — task consumer workers for background processing

## Key Domain Entities

| Entity | Purpose |
|--------|---------|
| `Analysis` | A distributed computation task |
| `AnalysisBucket` | File storage container for an analysis |
| `Project` | User project grouping nodes and analyses |
| `ProjectNode` | A compute node assigned to a project |
| `Node` | Global registry of available compute nodes |
| `MasterImage` | Base Docker images for worker tasks |
| `Registry` | Docker registry configuration |
| `RegistryProject` | Project within a Docker registry |
