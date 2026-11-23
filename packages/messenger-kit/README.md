<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/messenger-kit 💬</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/messenger-kit)](https://www.npmjs.com/package/@privateaim/messenger-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Contract types for the FLAME Hub messenger: durable messages, wakeup events and socket events.**

The broker service, its HTTP client and a node share these types, so a send request, a pulled message and a wakeup
have one definition. Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Durable messages](#durable-messages) · [Wakeups](#wakeups) · [Socket events](#socket-events) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/messenger/messenger-kit.html)

---

## Installation

```bash
npm install @privateaim/messenger-kit --save
```

ESM only, Node.js `>=26.0.0`. Runtime dependencies are `zod`, `validup` and `@validup/zod`. `@privateaim/kit` is a
peer dependency (the validators extend its `TypedContainer`); `@privateaim/core-kit` is a declared peer dependency
as well.

To call the broker over HTTP, use [`@privateaim/messenger-http-kit`](https://www.npmjs.com/package/@privateaim/messenger-http-kit),
which takes and returns these types.

## Usage

```typescript
import { MessagePartyKind } from '@privateaim/messenger-kit';
import type { MessageAckRequest, MessagePullResponse, SendMessageRequest } from '@privateaim/messenger-kit';

declare const sealedPayload: string;
declare const pulled: MessagePullResponse;

const request: SendMessageRequest = {
    recipients: [{ type: MessagePartyKind.CLIENT, id: 'node-client-id' }],
    data: sealedPayload,
    metadata: { analysisId: 'analysis-id' },
};

const ack: MessageAckRequest = { ids: pulled.messages.map((message) => message.id) };
```

## Durable messages

The broker is an identity-to-identity store-and-forward transport: a sender posts a message, the broker stores one row
per recipient, and the recipient pulls and acknowledges it.

| Type | Shape | Used for |
|---|---|---|
| `MessageParty` | `{ type: 'user' \| 'robot' \| 'client', id }` | Sender or recipient; `id` is the Authup subject id |
| `MessagePartyKind` | `USER`, `ROBOT`, `CLIENT` | The `type` values |
| `SendMessageRequest` | `{ recipients, data?, metadata? }` | `POST /messages` body; the sender is the authenticated identity |
| `MessagePullQuery` | `{ limit?, wait? }` | `GET /messages` query; `wait` is a long-poll budget in milliseconds |
| `MessagePullResponse` | `{ messages: Message[] }` | Pending (un-acked) messages, oldest first |
| `MessageAckRequest` | `{ ids }` | `POST /messages/ack` body; acknowledged messages are deleted |
| `Message` | `id`, `senderType`, `senderId`, `recipientType`, `recipientId`, `data`, `metadata`, `createdAt` | A stored message; identities are flat columns, `createdAt` is an ISO-8601 string |
| `MessageData` | `Record<string, any> \| string \| null` | Opaque payload |
| `MessageMetadata` | `{ analysisId?, ... }` | Non-secret metadata, stored verbatim |

- **Hub never interprets `data`.** For analysis messaging it is ciphertext the sender produced, for example with
  `sealMessage()` from [`@privateaim/kit`](https://www.npmjs.com/package/@privateaim/kit).
- **`metadata.analysisId` carries the analysis scope**, so the receiving node can route the message to the right
  analysis. Hub does not act on it.
- **End-to-end encryption means one request per recipient**: each recipient's payload is sealed under a different key,
  so send a single-element `recipients` list per request. A shared or unencrypted payload can go to many recipients in
  one request.

The broker endpoints, limits and message lifetime are described in the
[messenger service reference](https://hub.docs.privateaim.net/reference/messenger/).

## Wakeups

A wakeup tells a recipient that a message is waiting. It carries only the recipient, never the payload; the recipient
then pulls over REST.

```typescript
import { WakeupEventName } from '@privateaim/messenger-kit';
import type { MessagePendingEvent } from '@privateaim/messenger-kit';

const event: MessagePendingEvent = { recipient: { type: 'client', id: 'node-client-id' } };

console.log(WakeupEventName.MESSAGE_PENDING); // 'messagePending'
```

`MessagePendingEvents` maps `messagePending` to its listener signature. The broker sends the same event on its
Server-Sent Events stream (`GET /messages/stream`) and on its Socket.IO connection.

## Socket events

The Socket.IO surface of the messenger (presence and a direct relay) is typed by client-to-server (`CTS`) and
server-to-client (`STC`) event maps. Pass them to Socket.IO's generics:

```typescript
import { WakeupEventName } from '@privateaim/messenger-kit';
import type { CTSEvents, STCEvents } from '@privateaim/messenger-kit';
import type { Socket } from 'socket.io-client';

declare const socket: Socket<STCEvents, CTSEvents>;

socket.on(WakeupEventName.MESSAGE_PENDING, ({ recipient }) => {
    console.log(recipient.id);
});
```

| Export | Purpose |
|---|---|
| `STCEvents` / `CTSEvents` | Combined server-to-client and client-to-server event maps (`STCEvents` includes `messagePending`) |
| `STSEvents` | Untyped `{ [event]: (...args) => void }` map for Socket.IO's inter-server events |
| `STCConnectionEventName` / `CTSConnectionEventName` | Presence: `userConnected`, `clientDisconnected`, ..., `userConnections`, `clientConnectionSubscribe`, ... |
| `STCMessagingEventName` / `CTSMessagingEventName` | The relay `send` event |
| `CTSMessagingMessage` / `STCMessagingMessage` / `CTSMessagingParty` | Relay payloads (`to` on the way in, `from` on the way out) |
| `CTSMessagingMessageValidator` / `CTSMessagingPartyValidator` | validup containers for a relay message and one party |
| `STCEventContext`, `EventTarget`, `EventCallback` | Payload context (`meta.roomName`, `meta.roomId`), subscription target, acknowledgement callback |
| `isEventCallback(input, fnArgs?)` / `isEventTarget(input)` | Guards for socket handler arguments |

```typescript
import { CTSMessagingMessageValidator } from '@privateaim/messenger-kit';

declare const input: unknown;

const message = await new CTSMessagingMessageValidator().run(input);
```

The validator accepts `data` as an object, string, `null` or absent, `metadata` as an object, `null` or absent, and
requires every `to` entry to have a `type` of `user`, `robot` or `client` and a UUID `id`. It rejects with a validup
error naming the failing path (for example `to.type`).

## Notes

- **Delivery is at least once.** A message stays in the mailbox until it is acknowledged, so a pull can return it
  again after a crash; deduplicate on `Message.id`.
- **The Socket.IO relay and presence events are legacy.** The durable mailbox replaces them, and they are retired
  together with the legacy relay. New consumers use the REST API and its wakeups.
- **The `send` and `messagePending` keys of the event maps are enum members.** With Socket.IO's typed `on()` /
  `emit()`, pass `WakeupEventName.MESSAGE_PENDING` or `STCMessagingEventName.SEND`; the string literal does not
  type-check. The presence keys are plain strings.
- **`CTSMessagingPartyValidator` requires a UUID `id`**, while `MessageParty.id` is typed as any string.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
