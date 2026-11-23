# @privateaim/messenger-kit

Messenger domain types: the durable broker's message and wakeup types, and the Socket.io connection and messaging events.

## Installation

```bash
npm install @privateaim/messenger-kit
```

## Usage

```typescript
import {
    CTSMessagingEventName,
    STCConnectionEventName,
    WakeupEventName,
} from '@privateaim/messenger-kit';
import type { Message, MessagePullQuery } from '@privateaim/messenger-kit';

const query: MessagePullQuery = { limit: 50, wait: 30_000 };
```

Event names are split by direction: `CTS*` (client to server) and `STC*` (server to client).

## API

### Exports

| Module | Description |
|--------|-------------|
| `broker` | Durable mailbox types (`Message`, `MessageParty`, `MessagePartyKind`, `SendMessageRequest`, `MessagePullQuery`, `MessagePullResponse`, `MessageAckRequest`) and the wakeup (`WakeupEventName`, `MessagePendingEvent`) |
| `connection` | Connection lifecycle events (`STCConnectionEventName`, `CTSConnectionEventName`) |
| `messaging` | Socket messaging events (`STCMessagingEventName`, `CTSMessagingEventName`), payload types and validators (`CTSMessagingMessageValidator`, `CTSMessagingPartyValidator`) |
| `types` | Socket event maps (`STCEvents`, `CTSEvents`) and callback types |
| `utils` | `isEventCallback`, `isEventTarget` type guards |

## Dependencies

- `@privateaim/kit` — `TypedContainer` for the validators (peer dependency)
- `@privateaim/core-kit` — Domain types (peer dependency)
- `@validup/zod` — Zod validation adapter
- `validup` — Validation utilities
- `zod` — Schema validation
