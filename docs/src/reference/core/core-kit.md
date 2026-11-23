# @privateaim/core-kit

Domain models, validators and error definitions for the PrivateAIM core service. Defines all entity types used by `server-core` and consumed by clients.

## Installation

```bash
npm install @privateaim/core-kit @privateaim/kit @authup/core-kit
```

`@privateaim/kit`, `@authup/core-kit` and `@privateaim/telemetry-kit` are peer dependencies.

## Usage

### Domain Types

```typescript
import type {
    Analysis,
    MasterImage,
    Node,
    Project,
    Registry,
} from '@privateaim/core-kit';
import type { ProcessStatus } from '@privateaim/kit';

// buildStatus, distributionStatus and executionStatus are typed as `${ProcessStatus}` | null.
const status: `${ProcessStatus}` | null = analysis.buildStatus;
```

### Validators

Every writable entity has a validator class (`AnalysisValidator`, `ProjectValidator`, `NodeValidator`, …) built on validup and Zod. Server-core runs the same classes on its create and update routes.

```typescript
import { AnalysisValidator } from '@privateaim/core-kit';
import { ValidatorGroup } from '@privateaim/kit';

const validator = new AnalysisValidator();

// Throws a ValidupError on invalid input; resolves to the normalized data.
const data = await validator.run(input, { group: ValidatorGroup.CREATE });
```

`safeRun()` returns a result object instead of throwing.

### Error Handling

```typescript
import { AnalysisBuilderCommandChecker, AnalysisError } from '@privateaim/core-kit';

try {
    AnalysisBuilderCommandChecker.canStart(analysis);
} catch (e) {
    if (e instanceof AnalysisError) {
        console.log(e.message);
    }
}
```

## API

### Exports

| Module | Description |
|--------|-------------|
| `domains` | Entity types, validators, enums and command checkers: Analysis, Node, Project, Registry, MasterImage, etc. |
| `AnalysisStorageToken` / `AnalysisStorageTokenCreatePayload` / `AnalysisStorageTokenValidator` | Request and response of the storage-token mint route |
| `error` | `APIConnectionStringError` and the `ErrorCode` enum (`AnalysisError` lives next to the analysis domain) |
| `constants` | `EnvironmentName` |

Process statuses (`ProcessStatus`), permission names (`PermissionName`) and `ValidatorGroup` come from `@privateaim/kit`.

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

### Channel Helpers

| Export | Purpose |
|--------|---------|
| `buildDomainChannelName(type, id?)` | Socket room of an entity type or one record: `analysis` or `analysis/<id>` |
| `buildDomainNamespaceName(id?)` | Socket namespace: `/resources` or `/resources/<realmId>` |

## Dependencies

- `@privateaim/kit`: Core utilities (peer)
- `@authup/core-kit`: Authup types (peer)
- `@privateaim/telemetry-kit`: Telemetry types (peer)
- `@privateaim/errors`: Shared `HubError` base class
- `validup`, `@validup/zod`, `zod`: Validation
