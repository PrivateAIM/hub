# @privateaim/messenger-kit

Messenger domain types for real-time event-driven communication between Hub components.

## Installation

```bash
npm install @privateaim/messenger-kit
```

## Usage

```typescript
import {
    ConnectionEventName,
    MessagingEventName,
} from '@privateaim/messenger-kit';
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `connection` | Connection lifecycle event types |
| `messaging` | Message event types and payloads |
| `types` | Shared TypeScript types |
| `utils` | Serialization and utility helpers |

## Dependencies

- `@privateaim/core-kit` — Domain types
- `@validup/adapter-zod` — Zod validation adapter
- `validup` — Validation utilities
- `zod` — Schema validation
