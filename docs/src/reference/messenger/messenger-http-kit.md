# @privateaim/messenger-http-kit

HTTP client for the Hub messenger's durable store-and-forward broker surface.

Unlike the other Hub HTTP kits this is **not** an entity API: the messenger
exposes a protocol (send / pull / acknowledge), so nothing here carries the
`{ data, meta }` envelope and the pull query is built with `URLSearchParams`
rather than rapiq.

## Installation

```bash
npm install @privateaim/messenger-http-kit
```

## Usage

```typescript
import { Client } from '@privateaim/messenger-http-kit';

const client = new Client({
    baseURL: 'http://localhost:4003',
});

// Send one message; the hub persists a durable row per recipient.
const ids = await client.message.send({ /* … */ });

// Pull pending (un-acked) messages, oldest first.
const { messages } = await client.message.pull({ limit: 50, wait: 30 });

// Acknowledge by id — the hub deletes them for the caller (delete-on-ack).
await client.message.ack({ ids: messages.map((message) => message.id) });
```

## Contract

`Client` implements `IMessengerClient`, and `MessageAPI` implements
`IMessageAPI`:

```typescript
import type { IMessengerClient } from '@privateaim/messenger-http-kit';

// Depend on the CONTRACT, not the class.
function relay(client: IMessengerClient) { /* … */ }
```

| Sub-API | Contract |
|---|---|
| `message` | `IMessageAPI` — `send` / `pull` / `ack` |

## Testing

`@privateaim/messenger-http-kit/testing` ships a `FakeClient`: a real `Client`
wired to hapic's `MemoryTransport`. Only the transport is replaced, so header
merging, body transformation, decoding, retries and the client's own
`RESPONSE_ERROR` hook all still run.

```typescript
import { createFakeClient, fakeResponse } from '@privateaim/messenger-http-kit/testing';

const client = createFakeClient({
    handlers: {
        'GET /messages': () => ({ messages: [{ id: 'm1' }] }),
        'POST /messages/ack': () => undefined,
    },
});

const { messages } = await client.message.pull({ limit: 5 });

// Every dispatched request is recorded, normalized.
expect(client.requests[0].url).toContain('limit=5');
```

- Handler keys are `'<METHOD> /<path>'`; a `:name` segment captures into `req.params`.
- The query string is ignored for matching and `'*'` is a catch-all that always loses to a specific pattern.
- A handler returns the response **body**; return `fakeResponse(status, body)` for a non-2xx.
- Keep the default path-free `baseURL` — a `baseURL` carrying a path shifts every
  pathname, and patterns silently stop matching.

## API

### Exports

| Module | Description |
|--------|-------------|
| `Client` | The messenger HTTP client |
| `IMessengerClient` / `ClientOptions` | The client contract and its construction options |
| `MessageAPI` / `IMessageAPI` | The message sub-API and its contract |
| `./testing` (subpath) | `FakeClient`, `createFakeClient`, `fakeResponse`, `matchRoute` |

## Dependencies

- `@privateaim/messenger-kit` — Message domain types
- `hapic` — HTTP client base

## Related

- [Messenger Service](/reference/messenger/)
- [messenger-kit](/reference/messenger/messenger-kit)
