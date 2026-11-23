<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/server-core-worker-kit 🏭</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/server-core-worker-kit)](https://www.npmjs.com/package/@privateaim/server-core-worker-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Command and event contracts between the FLAME Hub core service and its background worker.**

The core service dispatches commands and the worker answers with events over the message bus; this package holds both
sides' names, payload types, routings and dispatchers, so the two cannot drift apart. Part of the
[FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Components](#components) · [Routings](#routings) · [Error codes](#error-codes) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/worker/server-core-worker-kit.html)

---

## Installation

```bash
npm install @privateaim/server-core-worker-kit --save
```

ESM only, Node.js `>=26.0.0`. It depends on [`hubwire`](https://github.com/tada5hi/hubwire) (message bus, dispatchers,
workers), `@privateaim/kit` and `@privateaim/core-kit`.

## Usage

The core service sends a command through a component dispatcher:

```typescript
import { AnalysisBuilderComponentDispatcher } from '@privateaim/server-core-worker-kit';
import type { IMessageBus } from 'hubwire';

declare const messageBus: IMessageBus;

const dispatcher = new AnalysisBuilderComponentDispatcher({ messageBus });

await dispatcher.dispatchExecute({ id: 'analysis-id' });
await dispatcher.dispatchCheck({ id: 'analysis-id' });
```

The worker consumes the task routing and publishes its events to the event routing; the core service consumes those
events:

```typescript
import {
    AnalysisBuilderEventMessageBusRouting,
    AnalysisBuilderTaskMessageBusRouting,
} from '@privateaim/server-core-worker-kit';
import type { AnalysisBuilderEventMap } from '@privateaim/server-core-worker-kit';
import { RemoteWorker } from 'hubwire';
import type { ICallable, IMessageBus } from 'hubwire';

declare const messageBus: IMessageBus;
declare const builder: ICallable<AnalysisBuilderEventMap>;
declare const aggregator: ICallable<AnalysisBuilderEventMap>;

// worker
const worker = new RemoteWorker(builder, {
    consume: AnalysisBuilderTaskMessageBusRouting,
    publish: AnalysisBuilderEventMessageBusRouting,
    messageBus,
});

// core service
const replies = new RemoteWorker(aggregator, {
    consume: AnalysisBuilderEventMessageBusRouting,
    messageBus,
});

await Promise.all([worker.start(), replies.start()]);
```

## Components

| Component | Commands | Events | Dispatcher |
|---|---|---|---|
| Analysis builder | `execute`, `check` | `executionStarted`, `executionProgress`, `executionFinished`, `executionFailed`, `checkStarted`, `checkFinished`, `checkFailed` | `AnalysisBuilderComponentDispatcher` |
| Analysis distributor | `execute`, `check` | same as the builder | `AnalysisDistributorComponentDispatcher` |
| Master-image builder | `execute` | `executionStarted`, `executionProgress`, `executionFinished`, `executionFailed` | `MasterImageBuilderComponentDispatcher` |
| Master-image synchronizer | `execute` | `executionStarted`, `executionFinished`, `executionFailed` | `MasterImageSynchronizerComponentDispatcher` |

Each component exports a `<Component>Command` and a `<Component>Event` enum, an `<Component>EventMap` type that maps
every command and event to its `[payload, ComponentMetadata]` tuple, and the payload types:

| Payload | Shape |
|---|---|
| Builder / distributor / master-image builder base | `{ id, error? }`, where `id` is the analysis or master-image id |
| `*ExecutionProgressPayload` | base plus `progress` (a Docker build or push progress record) |
| `AnalysisBuilderExecutionFinishedPayload` | base plus `hash?`, `size?` (bytes), `os?` of the built image |
| `AnalysisBuilderCheckFinishedPayload` | base plus `status?` (`ProcessStatus`), `checkedAt?`, `hash?`, `size?`, `os?` |
| `AnalysisDistributorCheckFinishedPayload` | base plus `status?`, `checkedAt?` |
| `MasterImageSynchronizerExecutePayload` | `{ owner, repository, branch }` of the master-image Git repository |
| `MasterImageSynchronizerExecutionFinishedPayload` | `{ images, groups }` found in the repository |
| `MasterImageSynchronizerFailedEventPayload` | `{ error }` |

- **`checkedAt`** is the `updatedAt` of the analysis snapshot a check verdict was made on, so the core service can
  drop a verdict about an older state. It is optional: workers predating it do not send it.
- Every dispatcher method takes an optional `ComponentMetadata` as its second argument and resolves once the command
  is published, not when the worker handled it.

## Routings

| Component | Task routing (commands) | Event routing (replies) |
|---|---|---|
| Analysis builder | `analysisBuilderCommands` | `analysisBuilderEvents` |
| Analysis distributor | `analysisDistributorCommands` | `analysisDistributorEvents` |
| Master-image builder | `masterImageBuilderTasks` | `masterImageBuilderEvents` |
| Master-image synchronizer | `masterImageSynchronizerTasks` | `masterImageSynchronizerEvents` |

The constants are named `<Component>TaskMessageBusRouting` and `<Component>EventMessageBusRouting`. All are hubwire
`WORK` routings (one durable queue shared by all consumers).

- **Event routings are `ordered: true`.** On AMQP that declares the queue with `x-single-active-consumer`, so one core
  replica at a time handles the replies, in publish order. A stale progress event therefore cannot overwrite a
  finished status on another replica.
- **Publisher and consumer must declare the same arguments.** RabbitMQ answers a mismatch with a 406, so always use
  these constants on both sides; never rebuild a routing by hand.
- **Task routings are not ordered.** Several worker replicas compete for commands.

## Error codes

| Export | Values | Purpose |
|---|---|---|
| `ErrorCode` | `notFound`, `registryNotFound`, `registryProjectNotFound`, `none` | Codes the worker sets on errors it reports |
| `AnalysisBuilderErrorCode` | `entrypointNotFound`, `masterImageNotFound`, `unknown` | Analysis-build failures |
| `ComponentName` | `analysisDistributor`, `analysisBuilder`, `masterImageBuilder` | Component labels for logs |

## Notes

- **Roll out the worker before the core service.** The ordered event queues must exist with their new arguments
  before the core service starts consuming them.
- **`MasterImageBuilderComponentDispatcher` is not typed by its event map.** Its `dispatch()` accepts any key; use
  `dispatchExecute()`.
- **`ComponentName` has no entry for the master-image synchronizer.**

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
