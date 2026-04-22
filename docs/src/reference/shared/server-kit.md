# @privateaim/server-kit

Server-side foundation package providing logging, authentication integration, AMQP messaging, Redis, caching, and DI module infrastructure. Used by all Hub backend services.

## Installation

```bash
npm install @privateaim/server-kit
```

## Usage

### Logger (Winston)

```typescript
import { useLogger, LoggerModule } from '@privateaim/server-kit';

const logger = useLogger();
logger.info('Service started');
```

### Message Bus (AMQP)

```typescript
import { MessageBusModule } from '@privateaim/server-kit';
```

### Redis

```typescript
import { RedisModule } from '@privateaim/server-kit';
```

### Authup Integration

```typescript
import { AuthupModule } from '@privateaim/server-kit';
```

### Application Builder

```typescript
import { BaseApplicationBuilder } from '@privateaim/server-kit';

class MyAppBuilder extends BaseApplicationBuilder {
    // Add withConfig(), withDatabase(), withHTTP() etc.
}
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `app` | `BaseApplicationBuilder`, `Application` base class |
| `logger` | Winston logger setup and `LoggerModule` |
| `message-bus` | AMQP message bus module and utilities |
| `redis` | Redis module and connection helpers |
| `authup` | Authup authentication middleware module |
| `cache` | Cache module (Redis-backed) |
| `config` | Configuration reading via `envix` |
| `entity-event` | Entity event pub/sub system |
| `task-manager` | Task lifecycle management |
| `aggregator` | AMQP event aggregator base classes |
| `component` | AMQP task consumer component base classes |
| `constants` | Module names, injection keys |

### Shared DI Modules

| Module Class | Purpose |
|-------------|---------|
| `LoggerModule` | Winston logger with optional telemetry transport |
| `RedisModule` | Redis client registration |
| `MessageBusModule` | AMQP connection and queue management |
| `AuthupModule` | Authup middleware and token validation |
| `CacheModule` | Redis-backed caching |
| `EntityEventModule` | Domain event dispatching |

## Dependencies

- `winston` — Logging
- `@ebec/http` — HTTP error types
- `@hapic/oauth2` — OAuth2 client
- `orkos` — Module system (`IModule`)
- `eldin` — DI container (`TypedToken`)
- `envix` — Environment variable reading
