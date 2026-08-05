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

### Validation

`TypedContainer` is validup's `Container` with the `mount()` key escape hatch
closed. validup types the key as `Path<T> | (string & {})`, so **any** string
compiles — a stale or misspelled key silently stops validating that field, the
value is dropped from the write, and the request still returns `200`.

**Extend `TypedContainer<T>` rather than `Container<T>` in every validator.**

```typescript
import { TypedContainer, ValidatorGroup } from '@privateaim/kit';
import { createValidator } from '@validup/zod';
import { z } from 'zod';

export class RegistryValidator extends TypedContainer<Registry> {
    protected override initialize() {
        super.initialize();

        this.mount('accountSecret', { optional: true }, createValidator(z.string()));

        // Compile error: 'account_secret' is not a property of Registry.
        this.mount('account_secret', { optional: true }, createValidator(z.string()));
    }
}
```

Nested and wildcard keys still work (`registry.accountSecret`, `registry.*`), and
a container whose `T` genuinely has snake_case properties — a third-party webhook
body, say — keeps its keys.

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
| `validator` | `TypedContainer` / `ITypedContainer` (mount-key-safe validup container), `ValidatorGroup` |

## Dependencies

- `@authup/kit` — Authup base types
- `@authup/core-kit` — Authup core types
- `@ebec/http` — HTTP error types
- `nanoid` — ID generation
- `pathtrace` — `Path<T>` key type behind `TypedContainer`
- `validup` — Validation utilities
