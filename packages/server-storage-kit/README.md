<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/server-storage-kit 📦</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/server-storage-kit)](https://www.npmjs.com/package/@privateaim/server-storage-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Message bus contract of the FLAME Hub storage service: bucket and bucket-file commands, events and dispatchers.**

You import the routings, command and event names, payload types and typed dispatchers instead of repeating queue names and
payload shapes in every service that talks to storage. Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Consuming events](#consuming-events) · [Routings](#routings) · [Commands and events](#commands-and-events) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/storage/server-storage-kit.html)

---

## Installation

```bash
npm install @privateaim/server-storage-kit
```

The package ships ESM only and needs Node.js `>=26.0.0`. `@privateaim/kit`, `@privateaim/server-kit` and
`@privateaim/storage-kit` are peer dependencies; the dispatchers build on [`hubwire`](https://github.com/tada5hi/hubwire)'s
`RemoteDispatcher`.

## Usage

A dispatcher publishes a command onto its task routing; server-storage's worker handles it and replies with events.

```typescript
import { BucketComponentDispatcher } from '@privateaim/server-storage-kit';

const dispatcher = new BucketComponentDispatcher({ messageBus });

await dispatcher.dispatchCreate({
    name: 'analysis-bucket',
    realmId,
    refType: 'analysis',
    refId: analysisId,
});

await dispatcher.dispatchClear({ id: bucketId });
await dispatcher.dispatchDelete({ id: bucketId });
```

- `messageBus` is a hubwire `IMessageBus`. In FLAME Hub, resolve `RemoteMessageBusInjectionKey` from `@privateaim/server-kit`:
  the consumer is another service, so the in-memory bus would deliver the command to nobody.
- Every `dispatch*` method takes an optional second argument, the hubwire `ComponentMetadata` sent with the message.
- The method resolves once the message is published, not when storage has handled it. The outcome arrives as an event.

| Dispatcher | Routing | Methods |
|---|---|---|
| `BucketComponentDispatcher` | `BucketTaskMessageBusRouting` | `dispatchCreate`, `dispatchDelete`, `dispatchClear` |
| `BucketFileTaskDispatcher` | `BucketFileTaskMessageBusRouting` | `dispatchCreate`, `dispatchDelete` |
| `BucketFileEventDispatcher` | `BucketFileEventMessageBusRouting` | `dispatch(key, data, metadata)` to publish bucket-file events (used by server-storage) |

## Consuming events

The event maps type a hubwire `Component` that handles storage's replies. Mount one handler per event and consume the event routing
with a `RemoteWorker`:

```typescript
import type { BucketComponentEventMap } from '@privateaim/server-storage-kit';
import { BucketEvent, BucketEventMessageBusRouting } from '@privateaim/server-storage-kit';
import { Component, RemoteWorker } from 'hubwire';

const component = new Component<BucketComponentEventMap>();

component.mount(BucketEvent.CREATION_FINISHED, async (bucket) => {
    // bucket: Bucket from @privateaim/storage-kit
});

component.mount(BucketEvent.CLEARING_FINISHED, async ({ id, fileIds }) => {
    // fileIds: the files this clear removed
});

const worker = new RemoteWorker(component, {
    consume: BucketEventMessageBusRouting,
    messageBus,
});

await worker.start();
```

## Routings

| Export | Type | Key | Ordered | Carries |
|---|---|---|---|---|
| `BucketTaskMessageBusRouting` | `work` | `storageBucketTasks` | no | Bucket commands to server-storage |
| `BucketEventMessageBusRouting` | `work` | `storageBucketEvents` | yes | Bucket events back to the requester |
| `BucketFileTaskMessageBusRouting` | `work` | `storageBucketFileTasks` | no | Bucket-file commands to server-storage |
| `BucketFileEventMessageBusRouting` | `work` | `storageBucketFileEvents` | yes | Bucket-file events back to the requester |

## Commands and events

| Enum | Values |
|---|---|
| `BucketCommand` | `create`, `delete`, `clear` |
| `BucketEvent` | `creationStarted` / `creationFinished` / `creationFailed`, `deletionStarted` / `deletionFinished` / `deletionFailed`, `clearingStarted` / `clearingFinished` / `clearingFailed` |
| `BucketFileCommand` | `create`, `delete` |
| `BucketFileEvent` | `creationStarted` / `creationFinished` / `creationFailed`, `deletionStarted` / `deletionFinished` / `deletionFailed` |

`BucketComponentEventMap` and `BucketFileComponentEventMap` map every command and event to its `[payload, ComponentMetadata]` tuple.
The payload types are exported individually:

| Key | Payload type |
|---|---|
| `BucketCommand.CREATE` | `BucketCreateCommandPayload` (`Partial<Bucket>`) |
| `BucketCommand.DELETE` / `CLEAR` | `BucketDeleteCommandPayload` / `BucketClearCommandPayload` (`{ id }`) |
| `BucketEvent.CREATION_FINISHED` / `DELETION_FINISHED` | `Bucket` |
| `BucketEvent.CLEARING_FINISHED` | `BucketClearingFinishedEventPayload` (`Bucket & { fileIds }`) |
| `BucketEvent.*_FAILED` | `{ id, error }`; creation also echoes `refType`, `refId` and `name` |
| `BucketFileCommand.CREATE` | `BucketFileCreateCommandPayload` (`{ meta: Partial<BucketFile>, data: Readable }`) |
| `BucketFileCommand.DELETE` | `BucketFileDeleteCommandPayload` (`{ id }`) |
| `BucketFileEvent.CREATION_FINISHED` | `Omit<BucketFile, 'bucket'>` |
| `BucketFileEvent.DELETION_FINISHED` | `BucketFile` |

## Notes

- **Event routings are ordered.** Both event routings set `ordered: true`: one durable queue shared by all replicas of the
  requesting service, handled by one consumer at a time in publish order. The task routings are not ordered.
- **A clear reports only what it removed.** `fileIds` of `clearingFinished` lists the files removed by that clear; a file
  uploaded while the clear ran is not in it and stays in the bucket.
- **`BucketFileCommand.CREATE` carries a stream.** Its `data` is a Node.js `Readable`, so server-storage handles it in-process
  during an upload and publishes only the resulting events. Do not send it through `BucketFileTaskDispatcher`.
- **`BucketFileEventDispatcher` publishes events only.** It has no command helpers; publish with its generic `dispatch()` and a
  `BucketFileEvent` key. Commands go through `BucketFileTaskDispatcher`.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
