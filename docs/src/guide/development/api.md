# API Reference

The Core API (`server-core`) exposes REST endpoints for managing all domain entities. Each service also generates Swagger/OpenAPI documentation when running.

## Base URL

```
http://localhost:4000
```

## Authentication

All endpoints (except health checks) require authentication via Authup. Include a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Response Shapes

Every entity endpoint answers with one of two envelopes. Both carry the payload under `data` and
response-scoped extras under `meta`.

### Record responses

Every single-record endpoint — `getOne`, `create`, `update`, `delete`, and the entity command
routes — wraps the record in `{ data, meta }`:

```jsonc
// GET /nodes/1f9c0b7a-...
{
    "data": { "id": "1f9c0b7a-...", "name": "node-a", "online": true },
    "meta": { "schema": { /* see Query Capability Discovery */ } }
}
```

Mutations carry the same envelope with an **empty** `meta` — `{}`, never omitted, never `null`:

```jsonc
// POST /nodes  ->  201 Created
{ "data": { "id": "1f9c0b7a-...", "name": "node-a" }, "meta": {} }
```

::: warning Breaking change
Record endpoints previously answered with the bare entity. Consumers must now unwrap `data`.
See [`@privateaim/core-http-kit`](/reference/core/core-http-kit) for the client-side migration.
:::

### Collection responses

Collections were already enveloped, so their shape is **unchanged** apart from the new optional
`meta.schema`:

```jsonc
// GET /nodes
{
    "data": [ /* ... */ ],
    "meta": { "limit": 50, "offset": 0, "total": 128, "schema": { /* ... */ } }
}
```

`total` is always present. `limit` and `offset` report the pagination the server actually applied,
so they are absent when no pagination was applied.

### Endpoints that stay flat

The governing rule: **entity-record shapes get the envelope; protocol, credential, stream and
bespoke shapes stay flat.** These endpoints answer with their own shape and never with
`{ data, meta }`:

| Endpoint | Shape | Why it stays flat |
|----------|-------|-------------------|
| `GET /` (core, storage, telemetry) | `{ version, timestamp }` | Service metadata, not a record |
| `POST /services/:id/hook` | `null` (202) | Harbor webhook protocol |
| `POST /services/:id/command` | `null` (202) | Harbor command protocol |
| `GET`/`POST` `/nodes/:id/client/credentials` | `ClientCredentials` | OAuth2 credential payload |
| `GET`/`POST` `/analyses/:id/client/credentials` | `ClientCredentials` | OAuth2 credential payload |
| `GET /nodes/:id/registry/credentials` | `RegistryCredentials` | Projection over registry + registry project, not a persisted record |
| `DELETE /analysis-logs` | `null` (202) | Bulk delete, nothing to return |
| `DELETE /analysis-node-logs` | `null` (202) | Bulk delete, nothing to return |
| `DELETE /logs` (telemetry) | `null` (202) | Bulk delete, nothing to return |
| `GET /buckets/:id/stream` | binary stream | `Content-Type` + attachment headers |
| `GET /bucket-files/:id/stream` | binary stream | `Content-Type` + attachment headers |
| `POST /buckets/:id/upload` | `{ data: files, meta: { total } }` | Returns *many* files — stays a **collection**, it is not a record response |
| entire `server-messenger` message surface | id list / `{ messages }` / void | No entity records at all |

## Query Capability Discovery

Every query-capable `GET` describes its own queryable vocabulary under `meta.schema` — which
`filter`, `fields`, `sort` and `include` keys the endpoint accepts, plus the pagination cap — so a
consumer never has to read server source to build a valid query.

Collection reads advertise the full vocabulary:

```jsonc
// GET /nodes  ->  meta.schema
{
    "name": "node",
    "strict": true,
    "fields": {
        "default": ["id", "name", "client_id", "external_name", "hidden", "type", "online", "public_key", "robot_id", "realm_id", "registry_id", "registry_project_id", "created_at", "updated_at"],
        "allowed": ["id", "name", "client_id", "external_name", "hidden", "type", "online", "public_key", "robot_id", "realm_id", "registry_id", "registry_project_id", "created_at", "updated_at"]
    },
    "filters": { "allowed": ["id", "name", "online", "hidden", "client_id", "realm_id", "robot_id"] },
    "pagination": { "maxLimit": 50 },
    "relations": {
        "allowed": ["registry_project", "registry"],
        "schemas": { "registry_project": "registryProject", "registry": "registry" }
    },
    "sort": { "allowed": ["name", "updated_at", "created_at"], "default": null }
}
```

Single-record reads advertise only the subset a record read processes — `fields` and `relations`.
The `filters`, `sort` and `pagination` keys are **absent** (not `null`):

```jsonc
// GET /nodes/1f9c0b7a-...  ->  meta.schema
{
    "name": "node",
    "strict": true,
    "fields": { "default": ["id", "name", /* ... */], "allowed": ["id", "name", /* ... */] },
    "relations": {
        "allowed": ["registry_project", "registry"],
        "schemas": { "registry_project": "registryProject", "registry": "registry" }
    }
}
```

Mutations (`POST`, `DELETE`) describe nothing — their `meta` is exactly `{}`.

### Reading rules

- The description is the **static upper bound** — the allow-list declared by the schema, *not* an
  actor-aware view. Actor-dependent gates (the `account_secret` field gate on registries, realm
  scoping) are deliberately **not** reflected and may still strip individual keys per request.
  A name appearing in `fields.allowed` means the query parser accepts it, not that you will get it.
- The shape is **normalized** — every described parameter carries every constraint key. **`null`
  means the constraint was never declared** and the server-side fallback applies; an **empty array
  means an explicit "nothing allowed"**. These two are easy to confuse and mean opposite things.
- Relation vocabulary is **referenced, not expanded**. `relations.schemas` names the schema
  governing each relation instead of inlining it, so dotted keys such as `filter[registry.name]`
  are discovered from the `registry` entity's own endpoints.
- `sort.allowed` is **derived from `sort.default`** when no explicit allow-list is declared
  (e.g. master images declare `sort: { default: { path: 'ASC' } }` and describe as
  `{ allowed: ["path"], default: { path: "ASC" } }`).

### Endpoints without capability discovery

| Endpoint | Why |
|----------|-----|
| `GET /logs` (telemetry) | Decoded as an open query — its filters are dynamic VictoriaLogs labels rather than a declared vocabulary, so there is nothing to describe. This is the one query endpoint without `meta.schema`. |
| `GET /analyses/:id/client/permissions` | Proxies Authup `ClientPermission` records; no Hub-side schema exists. |
| `POST /buckets/:id/upload` | A write that answers with a collection; it advertises `total` only. |

## Core Entities

Updates are issued as `POST /<collection>/:id` — there is no `PUT` route.
The **Shape** column tells you which envelope from [Response Shapes](#response-shapes) to expect.

### Analyses

| Method | Endpoint | Description | Shape |
|--------|----------|-------------|-------|
| `GET` | `/analyses` | List analyses | collection + `schema` |
| `GET` | `/analyses/:id` | Get analysis by ID | record + `schema` |
| `POST` | `/analyses` | Create analysis | record, `meta: {}` |
| `POST` | `/analyses/:id` | Update analysis | record, `meta: {}` |
| `POST` | `/analyses/:id/command` | Run an analysis command | record, `meta: {}` |
| `DELETE` | `/analyses/:id` | Delete analysis | record, `meta: {}` |

### Projects

| Method | Endpoint | Description | Shape |
|--------|----------|-------------|-------|
| `GET` | `/projects` | List projects | collection + `schema` |
| `GET` | `/projects/:id` | Get project by ID | record + `schema` |
| `POST` | `/projects` | Create project | record, `meta: {}` |
| `POST` | `/projects/:id` | Update project | record, `meta: {}` |
| `DELETE` | `/projects/:id` | Delete project | record, `meta: {}` |

### Nodes

| Method | Endpoint | Description | Shape |
|--------|----------|-------------|-------|
| `GET` | `/nodes` | List nodes | collection + `schema` |
| `GET` | `/nodes/:id` | Get node by ID | record + `schema` |
| `POST` | `/nodes` | Create node | record, `meta: {}` |
| `POST` | `/nodes/:id` | Update node | record, `meta: {}` |
| `DELETE` | `/nodes/:id` | Delete node | record, `meta: {}` |

### Registries

| Method | Endpoint | Description | Shape |
|--------|----------|-------------|-------|
| `GET` | `/registries` | List registries | collection + `schema` |
| `GET` | `/registries/:id` | Get registry by ID | record + `schema` |
| `POST` | `/registries` | Create registry | record, `meta: {}` |
| `POST` | `/registries/:id` | Update registry | record, `meta: {}` |
| `DELETE` | `/registries/:id` | Delete registry | record, `meta: {}` |

## Storage Service

Base URL: `http://localhost:4001`

### Buckets

| Method | Endpoint | Description | Shape |
|--------|----------|-------------|-------|
| `GET` | `/buckets` | List buckets | collection + `schema` |
| `GET` | `/buckets/:id` | Get bucket by ID | record + `schema` |
| `POST` | `/buckets` | Create bucket | record, `meta: {}` |
| `POST` | `/buckets/:id` | Update bucket | record, `meta: {}` |
| `DELETE` | `/buckets/:id` | Delete bucket | record, `meta: {}` |
| `POST` | `/buckets/:id/upload` | Upload files to a bucket | collection, no `schema` |
| `GET` | `/buckets/:id/stream` | Stream the bucket contents as a tar | flat (binary) |

### Bucket Files

| Method | Endpoint | Description | Shape |
|--------|----------|-------------|-------|
| `GET` | `/bucket-files` | List bucket files | collection + `schema` |
| `GET` | `/bucket-files/:id` | Get bucket file by ID | record + `schema` |
| `DELETE` | `/bucket-files/:id` | Delete bucket file | record, `meta: {}` |
| `GET` | `/bucket-files/:id/stream` | Stream file contents | flat (binary) |

## Telemetry Service

Base URL: `http://localhost:4002`

| Method | Endpoint | Description | Shape |
|--------|----------|-------------|-------|
| `GET` | `/events` | List events | collection + `schema` |
| `GET` | `/events/:id` | Get event by ID | record + `schema` |
| `POST` | `/events` | Create event | record, `meta: {}` |
| `DELETE` | `/events/:id` | Delete event | record, `meta: {}` |
| `GET` | `/logs` | Query logs | collection, **no `schema`** |
| `POST` | `/logs` | Write a log | record, `meta: {}` |
| `DELETE` | `/logs` | Delete logs | flat (`null`, 202) |

## Swagger Documentation

Each service generates OpenAPI documentation at runtime. When a service is running in development mode, visit:

- Core API: `http://localhost:4000/docs`
- Storage: `http://localhost:4001/docs`
- Telemetry: `http://localhost:4002/docs`
