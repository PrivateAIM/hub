# @privateaim/server-http-kit

HTTP server middleware, request handling utilities, and Swagger/OpenAPI documentation generation for Hub services.

## Installation

```bash
npm install @privateaim/server-http-kit
```

## Usage

### Middleware

```typescript
import { ForceLoggedInMiddleware } from '@privateaim/server-http-kit';
```

### Request Helpers

```typescript
import {
    useRequestIdentityRealm,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
```

### Swagger Generation

```typescript
import { generateSwaggerDocumentation } from '@privateaim/server-http-kit';
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `middlewares` | Auth middleware (`ForceLoggedInMiddleware`) |
| `request` | Request identity, permission, and query helpers |
| `swagger` | OpenAPI/Swagger documentation generator |
| `constants` | HTTP-specific constants |

## Dependencies

- `@authup/server-adapter` — Authup middleware
- `routup` — HTTP routing framework
- `@privateaim/server-kit` — Server foundation
- `hapic` — HTTP client utilities
- `cors` — CORS middleware
