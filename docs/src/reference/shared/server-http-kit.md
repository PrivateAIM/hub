# @privateaim/server-http-kit

HTTP server middleware, request handling utilities, and Swagger UI serving for Hub services.

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
    useRequestPermissionEvaluator, // the request's authup IPermissionEvaluator
} from '@privateaim/server-http-kit';
```

### Swagger UI

```typescript
import { mountSwaggerMiddleware } from '@privateaim/server-http-kit';

mountSwaggerMiddleware(app, { cwd: 'writable', baseURL: 'https://hub.example.com/core' });
```

`mountSwaggerMiddleware(app, { cwd?, baseURL? })` serves Swagger UI at `/docs` from an existing `swagger.json`
(`<cwd>/swagger.json`, default `<process.cwd()>/writable/swagger.json`). It generates nothing: the document is
produced at build time by the service's `build:swagger` script (`trapi generate`). `mountMiddlewares(app, { swagger })`
mounts it together with the other middlewares.

## API

### Exports

| Module | Description |
|--------|-------------|
| `middlewares` | `mountMiddlewares(app, options)` (prometheus, cors, basic, rate limit, authorization, decorators, swagger) and `mountErrorMiddleware`; auth middleware (`ForceLoggedInMiddleware`, `ForceIdentityOrCapabilityMiddleware`, `ForceIdentityOrStreamCapabilityMiddleware`); `createAuthupTokenVerifier({ baseURL, client: { id, secret, realm }, redisClient?, cache? })` for the `tokenVerifier` option, which introspects as `client` and caches results per that client; `createAuthupCapabilityTokenVerifier` for the `capability` option of the authorization middleware |
| `request` | Request identity, permission, and query helpers; `useRequestCapability` (a capability request has a capability and no identity, permission evaluator or token) |
| `health` | `mountHealthRoutes(app, health)` — anonymous `GET`/`HEAD` `/livez` and `/readyz` (200/503, `Cache-Control: no-store`); mount before every middleware |
| `constants` | HTTP-specific constants (`HTTPHandlerOperation`) |

`sanitizeError`, which turns any thrown value into the error the error middleware answers with, is internal and not
exported by the package.

## Dependencies

- `@authup/server-adapter-kit` — Authup token verification
- `routup` — HTTP routing framework
- `@privateaim/server-kit` — Server foundation
- `hapic` — HTTP client utilities
- `@routup/cors`, `@routup/basic`, `@routup/decorators`, `@routup/prometheus`, `@routup/rate-limit`, `@routup/swagger-ui` — routup plugins behind the middlewares
