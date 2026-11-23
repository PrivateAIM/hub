<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/core-realtime-kit ⚡</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/core-realtime-kit)](https://www.npmjs.com/package/@privateaim/core-realtime-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Typed Socket.IO event maps for the entity events of the FLAME Hub core service.**

You type a Socket.IO client or server once and get every `<entity>Created` / `<entity>Subscribe` event name and payload
checked by the compiler. Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Event maps](#event-maps) · [Helpers](#helpers) · [Documentation](https://hub.docs.privateaim.net/reference/core/core-realtime-kit.html)

---

## Installation

```bash
npm install @privateaim/core-realtime-kit @privateaim/core-kit @privateaim/kit
```

The package is ESM only, ships types and two small runtime helpers, and needs Node.js `>=26.0.0`. `@privateaim/core-kit` and
`@privateaim/kit` are peer dependencies. Bring your own Socket.IO client or server.

## Usage

```typescript
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { CTSEvents, STCEvents } from '@privateaim/core-realtime-kit';

const socket: Socket<STCEvents, CTSEvents> = io(`http://localhost:4000/resources/${realmId}`, {
    auth: { token: accessToken },
});

// Join the room of one project; the callback reports a denied subscription.
socket.emit('projectSubscribe', projectId, (error) => {
    if (error) {
        console.error(error.message);
    }
});

socket.on('projectUpdated', ({ data, meta }) => {
    console.log(meta.event, meta.refId, data.name);
});
```

The server (`server-core`) serves the namespaces `/resources/<realmId>` and the global `/resources`, and reads the Authup access
token from the handshake's `auth.token`. Build the namespace with `buildDomainNamespaceName()` from `@privateaim/core-kit`.

## Event maps

| Type | Direction | Events |
|---|---|---|
| `STCEvents` | server to client | `<domainType>Created`, `<domainType>Updated`, `<domainType>Deleted` for every key of `DomainTypeMap`, plus `pong` |
| `CTSEvents` | client to server | `<domainType>Subscribe`, `<domainType>Unsubscribe` for every key of `DomainTypeMap`, plus `ping` |
| `STSEvents` | server to server | An open map (`[event: string]`) for inter-server events |

Event names are built by `buildDomainEventFullName(type, event)` from `@privateaim/kit`: the domain type followed by the
capitalized event, e.g. `analysisNodeCreated`.

A server-to-client handler receives an `STCEventRecord<TYPE, RECORD>`:

| Field | Content |
|---|---|
| `data` | The entity, typed by `DomainTypeMap[TYPE]` from `@privateaim/core-kit` |
| `meta.event` | `created`, `updated` or `deleted` |
| `meta.refType` / `meta.refId` | The domain type and the record id |
| `meta.roomName` / `meta.roomId` | The room the event was sent to, when present |

A subscribe or unsubscribe event takes a `CTSEventHandler`: a target (`EventTarget`: a record id, or `undefined` for the
whole type) and an `EventCallback` the server calls with `null` on success or an `Error`.

## Helpers

| Export | Purpose |
|---|---|
| `isEventCallback(input, fnArgs?)` | Type guard for an acknowledgement callback; with `fnArgs`, the function must declare at least that many parameters |
| `isEventTarget(input)` | Type guard for a string, number or `undefined` subscription target |
| `STCEventName` / `CTSEventName` | Enums for user and robot connection events (`userConnected`, `robotConnectionSubscribe`, …) |

A server-side subscribe handler with these guards:

```typescript
import { buildDomainEventFullName } from '@privateaim/kit';
import { DomainEventSubscriptionName, DomainType, buildDomainChannelName } from '@privateaim/core-kit';
import { isEventCallback, isEventTarget } from '@privateaim/core-realtime-kit';

socket.on(
    buildDomainEventFullName(DomainType.PROJECT, DomainEventSubscriptionName.SUBSCRIBE),
    (target, cb) => {
        if (!isEventTarget(target)) {
            return;
        }

        socket.join(buildDomainChannelName(DomainType.PROJECT, target));

        if (isEventCallback(cb)) {
            cb(null);
        }
    },
);
```

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
