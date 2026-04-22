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

## Core Entities

### Analyses

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analyses` | List analyses |
| `GET` | `/analyses/:id` | Get analysis by ID |
| `POST` | `/analyses` | Create analysis |
| `PUT` | `/analyses/:id` | Update analysis |
| `DELETE` | `/analyses/:id` | Delete analysis |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects` | List projects |
| `GET` | `/projects/:id` | Get project by ID |
| `POST` | `/projects` | Create project |
| `PUT` | `/projects/:id` | Update project |
| `DELETE` | `/projects/:id` | Delete project |

### Nodes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/nodes` | List nodes |
| `GET` | `/nodes/:id` | Get node by ID |
| `POST` | `/nodes` | Create node |
| `PUT` | `/nodes/:id` | Update node |
| `DELETE` | `/nodes/:id` | Delete node |

### Registries

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/registries` | List registries |
| `GET` | `/registries/:id` | Get registry by ID |
| `POST` | `/registries` | Create registry |
| `PUT` | `/registries/:id` | Update registry |
| `DELETE` | `/registries/:id` | Delete registry |

## Storage Service

Base URL: `http://localhost:4001`

### Buckets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/buckets` | List buckets |
| `GET` | `/buckets/:id` | Get bucket by ID |
| `POST` | `/buckets` | Create bucket |
| `DELETE` | `/buckets/:id` | Delete bucket |

### Bucket Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/bucket-files` | List bucket files |
| `POST` | `/bucket-files` | Upload file to bucket |
| `GET` | `/bucket-files/:id/stream` | Stream file contents |

## Swagger Documentation

Each service generates OpenAPI documentation at runtime. When a service is running in development mode, visit:

- Core API: `http://localhost:4000/docs`
- Storage: `http://localhost:4001/docs`
- Telemetry: `http://localhost:4002/docs`
