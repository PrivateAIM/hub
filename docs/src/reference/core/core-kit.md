# @privateaim/core-kit

Domain models, types, and error definitions for the PrivateAIM core service. Defines all entity types used by `server-core` and consumed by clients.

## Installation

```bash
npm install @privateaim/core-kit
```

## Usage

### Domain Types

```typescript
import {
    Analysis,
    AnalysisRunStatus,
    Node,
    Project,
    Registry,
    MasterImage,
} from '@privateaim/core-kit';
```

### Validators

```typescript
import { analysisSchema } from '@privateaim/core-kit';

const result = analysisSchema.safeParse(data);
```

### Error Handling

```typescript
import { CoreError } from '@privateaim/core-kit';
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `domains` | Entity types: Analysis, Node, Project, Registry, MasterImage, etc. |
| `error` | Core-specific error types |
| `constants` | Domain constants and enums (statuses, permission names) |

### Key Domain Types

| Type | Description |
|------|-------------|
| `Analysis` | Distributed computation task |
| `AnalysisBucket` | File storage container for an analysis |
| `Project` | User project grouping nodes and analyses |
| `ProjectNode` | Node assigned to a project |
| `Node` | Compute node in the network |
| `MasterImage` | Base Docker image for worker tasks |
| `Registry` | Docker registry configuration |
| `RegistryProject` | Project within a Docker registry |

## Dependencies

- `@privateaim/kit` — Core utilities
- `@authup/core-kit` — Authup types
- `@privateaim/telemetry-kit` — Telemetry types
