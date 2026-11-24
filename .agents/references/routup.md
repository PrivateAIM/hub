# routup Reference

[routup](https://github.com/routup/routup) and [@routup plugins](https://github.com/routup/plugins) serve every hub HTTP surface (wiring in `packages/server-http-kit/src/middlewares/`). Behaviour that differs from what the API suggests:

| routup | Hub counterpart | Trap |
|---|---|---|
| `basic(options)` (@routup/basic) | `middlewares/basic.ts` | Cookie and query parsing are on only when `basic()` gets NO options; passing `body` options silently drops both. Name `cookie: true, query: true` (spec: `basic.spec.ts`). |
| `AppError.cause` | `middlewares/error.ts` | A thrown error arrives as `cause` of routup's wrapper; a routup/plugin 4xx (invalid JSON 400, body limit 413, encoding 415) carries none. Unwrap `cause` only when `Error.isError`, or those become 500. |
| `event.route` (6.4) | error log labels, prometheus | The matched route pattern (`/analyses/:id`), readable after `next()` and in the error handler. `@routup/prometheus` 4.1 labels `path` with it only on routup >= 6.4; older routup falls back to raw paths. |
| `event.signal` | token verification, messenger pull/SSE | Aborts when the client disconnects. A request that fails with its abort reason is not logged as a 5xx. |
| `@DStatus(n)` (decorators 5.1) | every non-200 success | The only way trapi documents 201/202; an `event.response.status` assignment leaves the operation documented as 200. |
| `assertRequestContentType(event, types)` (6.5) | storage upload | 415 for a missing or unlisted type, 400 for a malformed header; case-insensitive. `@DConsumes` enforces the same at runtime since decorators 5.4, skipping only a `null` body, which on Node is GET/HEAD alone: a body-less DELETE/POST is checked. |
| `@DProduces(type)` | storage stream routes | Documentation only for a method returning a `Response`; the handler still sets its content-type. |
| Node `stream.pipe()` into busboy / gzip | storage upload and download | `pipe()` forwards no source error: an aborted upload hangs and an aborted download leaks the object stream. Use `pipeline()`. |
