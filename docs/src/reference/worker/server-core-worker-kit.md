# @privateaim/server-core-worker-kit

Worker task payload types, message bus routings and dispatchers for the background worker service's components.

## Installation

```bash
npm install @privateaim/server-core-worker-kit
```

## Usage

```typescript
import {
    AnalysisBuilderComponentDispatcher,
    ComponentName,
} from '@privateaim/server-core-worker-kit';

const dispatcher = new AnalysisBuilderComponentDispatcher({ messageBus });
await dispatcher.dispatchExecute({ id: analysisId });

console.log(ComponentName.ANALYSIS_BUILDER); // 'analysisBuilder'
```

Each component ships a `*ComponentDispatcher` (a hubwire `RemoteDispatcher` bound to the component's task routing),
its command and event enums, payload types, and the `*TaskMessageBusRouting` / `*EventMessageBusRouting` constants
that server-core and the worker publish and consume on.

## API

### Exports

| Module | Description |
|--------|-------------|
| `components` | Analysis builder, analysis distributor, master-image builder and master-image synchronizer: dispatchers, commands, events, payload types and routings |
| `constants` | `ComponentName`, `ErrorCode` |

## Dependencies

- `@privateaim/kit` — Core utilities
- `@privateaim/core-kit` — Domain types
- `@privateaim/server-kit` — Server foundation
- `hubwire` — Message bus (`RemoteDispatcher`, routing types)
