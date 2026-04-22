# @privateaim/core-http-kit

Typed HTTP client for the PrivateAIM core API, built on [Hapic](https://github.com/tada5hi/hapic). Provides domain-specific API methods for all core entities.

## Installation

```bash
npm install @privateaim/core-http-kit
```

## Usage

### Creating a Client

```typescript
import { HTTPClient } from '@privateaim/core-http-kit';

const client = new HTTPClient({
    baseURL: 'http://localhost:4000',
});
```

### CRUD Operations

```typescript
// List analyses
const analyses = await client.analysis.getMany();

// Create a project
const project = await client.project.create({
    name: 'My Project',
});

// Get a node by ID
const node = await client.node.getOne(nodeId);

// Update an entity
await client.analysis.update(analysisId, { name: 'Updated' });

// Delete an entity
await client.analysis.delete(analysisId);
```

### With Authentication

```typescript
const client = new HTTPClient({
    baseURL: 'http://localhost:4000',
    token: 'Bearer <your-token>',
});
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `client` | `HTTPClient` class with typed domain API methods |
| `domains` | Domain-specific request/response types |

### Client Methods

The client exposes a property per domain entity, each with `getMany`, `getOne`, `create`, `update`, `delete` methods:

- `client.analysis`
- `client.analysisBucket`
- `client.analysisBucketFile`
- `client.project`
- `client.projectNode`
- `client.node`
- `client.registry`
- `client.registryProject`
- `client.masterImage`
- `client.masterImageGroup`

## Dependencies

- `@privateaim/core-kit` — Domain types
- `hapic` — HTTP client base
- `rapiq` — Query parameter building
