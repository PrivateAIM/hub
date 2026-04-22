# @privateaim/kit

Core utilities package providing cryptography, domain events, error handling, and shared TypeScript types for the entire PrivateAIM ecosystem.

## Installation

```bash
npm install @privateaim/kit
```

## Usage

### Crypto

```typescript
import { createNanoID } from '@privateaim/kit';

const id = createNanoID();
```

### Domain Events

```typescript
import { DomainEventName } from '@privateaim/kit';
```

### Error Handling

```typescript
import { isClientError } from '@privateaim/kit';
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `crypto` | Cryptographic utilities (ID generation) |
| `domains` | Shared domain type definitions |
| `error` | Error types and helpers |
| `domain-event` | Domain event names and types |
| `utils` | General utility functions |
| `constants` | Shared constants |
| `types` | Core TypeScript types |

## Dependencies

- `@authup/kit` — Authup base types
- `@authup/core-kit` — Authup core types
- `@ebec/http` — HTTP error types
- `nanoid` — ID generation
- `validup` — Validation utilities
