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

### Wakeup subscription

`message.subscribe()` reads the caller's `GET /messages/stream` (Server-Sent
Events) and yields typed wakeups. A wakeup carries only the recipient, never a
payload: on each one, `pull()` the mailbox. The hub sends one wakeup right after
connecting, so a fresh subscription also catches up on anything already queued.

```typescript
import { WakeupEventName } from '@privateaim/messenger-kit';

const controller = new AbortController();

for await (const event of client.message.subscribe({ signal: controller.signal })) {
    if (event.type === WakeupEventName.MESSAGE_PENDING) {
        const { messages } = await client.message.pull();
        // … process, then ack
    }
}

// elsewhere: controller.abort() closes the stream; the loop ends without an error
```

- **Events**: `MessageStreamEvent` is a union discriminated by `type`; today it
  has one member, `messagePending` with `data: MessagePendingEvent`
  (`{ recipient }`). `lastEventId` and `retry` carry the stream's last `id` /
  `retry` fields (the hub sends neither today).
- **Skipped**: keep-alive comments, event types the kit does not know and a
  `messagePending` whose data is not a wakeup payload.
- **No deadline**: the call passes `timeout: 0`, so a client-level `timeout`
  does not cut the open-ended stream. Bound it with the `signal` instead.
- **Abort**: aborting the signal (or `break`ing out of the loop) closes the
  connection; the iteration ends without throwing. A non-2xx answer rejects with
  the usual hapic `ClientError`.
- **No reconnect**: one response is read. When the loop ends without an abort,
  the server closed the stream: reconnect (with your own backoff), then pull
  once. The durable mailbox loses nothing across the gap, so no `Last-Event-ID`
  replay is needed.

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
| `message` | `IMessageAPI` — `send` / `pull` / `ack` / `subscribe` |

`MessageAPI` extends hapic's `BaseAPI`.

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

To test a consumer of `subscribe()`, serve a `FakeEventStream`: an open
`text/event-stream` response you feed by hand.

```typescript
import { FakeEventStream, createFakeClient } from '@privateaim/messenger-http-kit/testing';

const stream = new FakeEventStream();
const client = createFakeClient({
    handlers: { 'GET /messages/stream': () => stream.response },
});

stream.write('event: messagePending\ndata: {"recipient":{"type":"client","id":"c1"}}\n\n');
stream.close(); // ends the subscription; omit it to keep the stream open

// stream.cancelled turns true once the consumer aborts or breaks
```

A handler `Response` is tied to the request's signal as `fetch` does, so an
abort or a hapic `timeout` errors the body and cancels the source. Serve one
`FakeEventStream` per request: a body is read once.

## API

### Exports

| Module | Description |
|--------|-------------|
| `Client` | The messenger HTTP client |
| `IMessengerClient` / `ClientOptions` | The client contract and its construction options |
| `MessageAPI` / `IMessageAPI` | The message sub-API and its contract |
| `MessageStreamEvent` / `MessageSubscribeOptions` | The typed wakeup yielded by `subscribe()` and its options |
| `toMessageStreamEvent` / `isMessagePendingEvent` | Turn a parsed SSE message into a typed wakeup (or `undefined`); guard a wakeup payload |
| `./testing` (subpath) | `FakeClient`, `createFakeClient`, `fakeResponse`, `matchRoute`, `FakeEventStream` |

## Dependencies

- `@privateaim/messenger-kit` — Message domain types
- `hapic` — HTTP client base

## Related

- [Messenger Service](/reference/messenger/)
- [messenger-kit](/reference/messenger/messenger-kit)
