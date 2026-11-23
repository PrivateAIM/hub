<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/messenger-http-kit 📨</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/messenger-http-kit)](https://www.npmjs.com/package/@privateaim/messenger-http-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**HTTP client for the FLAME Hub messenger broker: send, pull and ack messages, woken by an SSE stream.**

You get typed calls for the durable mailbox REST API, a wakeup stream as an async iterator, and an in-memory fake for
tests. Built on [Hapic](https://github.com/tada5hi/hapic) with the contract types from
[`@privateaim/messenger-kit`](https://www.npmjs.com/package/@privateaim/messenger-kit). Part of the
[FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Sending and pulling](#sending-and-pulling) · [Wakeup subscription](#wakeup-subscription) · [Contract](#contract) · [Testing](#testing) · [API](#api) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/messenger/messenger-http-kit.html)

---

## Why messenger-http-kit?

The broker is a protocol (send, pull, acknowledge, wake up), not a CRUD resource, so it is not part of the core API
client. Talking to it with plain `fetch` leaves you to parse Server-Sent Events, keep a long-poll from tripping your
timeout and fake the server in tests.

| Concern | Plain `fetch` | messenger-http-kit |
|---|---|---|
| **Wakeups** | Parse `text/event-stream` by hand, skip keep-alives | `message.subscribe()` yields typed `messagePending` events and skips everything else |
| **Stream deadline** | A client-wide timeout cuts the open stream | `subscribe()` sends `timeout: 0` unless you set one |
| **Long-poll deadline** | `wait` and the request timeout race each other | `pull({ wait })` extends the deadline by `wait` |
| **Errors** | Read the body yourself | A non-2xx rejects with hapic's `HttpResponseError` (a `ClientError`), whose `message` is the server's |
| **Tests** | Mock `fetch` | `FakeClient` runs the real client on an in-memory transport, `FakeEventStream` feeds the stream |

## Installation

```bash
npm install @privateaim/messenger-http-kit --save
```

ESM only, Node.js `>=26.0.0`. `hapic` (`^3.1.0`) and `@privateaim/messenger-kit` are peer dependencies. The testing
helpers ship in the `@privateaim/messenger-http-kit/testing` subpath.

## Usage

```typescript
import { Client } from '@privateaim/messenger-http-kit';

const client = new Client({ baseURL: 'https://hub.example/messenger/' });
const controller = new AbortController();

// One wakeup on connect, then one per stored message. Wakeups carry no
// payload: pull, process, ack. Keep-alive comments are skipped.
for await (const event of client.message.subscribe({ signal: controller.signal })) {
    const { messages } = await client.message.pull({ limit: 100 });

    // ... process
    await client.message.ack({ ids: messages.map((message) => message.id) });
}

// The loop ends without an error on controller.abort(). If it ends on its
// own, the server closed the stream: reconnect, then pull once.
```

`Client` takes hapic's client options (`baseURL`, `headers`, `timeout`, `transport`, ...). Authenticate it as any
hapic client, for example with a bearer `Authorization` header.

## Sending and pulling

```typescript
import { Client } from '@privateaim/messenger-http-kit';

declare const sealedPayload: string;

const client = new Client({ baseURL: 'https://hub.example/messenger/', timeout: 10_000 });

// The hub stores one row per recipient and returns their ids.
const ids = await client.message.send({
    recipients: [{ type: 'client', id: 'node-client-id' }],
    data: sealedPayload,
    metadata: { analysisId: 'analysis-id' },
});

// Pending (un-acked) messages, oldest first. `wait` long-polls for up to 25 s.
const { messages } = await client.message.pull({ limit: 50, wait: 25_000 });

// Acknowledge by id: the hub deletes them for the caller.
await client.message.ack({ ids: messages.map((message) => message.id) });
```

| Method | Request | Resolves to |
|---|---|---|
| `send(data, options?)` | `POST /messages` | `string[]`, the ids of the stored messages |
| `pull(query?, options?)` | `GET /messages?limit=&wait=` | `{ messages: Message[] }` |
| `ack(data, options?)` | `POST /messages/ack` | `void` |
| `subscribe(options?)` | `GET /messages/stream` | `AsyncGenerator<MessageStreamEvent>` |

- **Per-call options.** Every method takes `APIRequestOptions` (`{ signal?, timeout? }`) last: `signal` aborts the
  call, `timeout` (milliseconds) overrides the client's for this call.
- **Long-poll.** `wait` is in milliseconds. With `wait > 0` the call's deadline (its own `timeout`, else the client's)
  is extended by `wait`, so an empty mailbox does not time out.
- **Unset query values are not sent.** The server defaults `limit` to 50 and caps it at 100, and caps `wait` at
  30 000 ms.
- **Errors.** A non-2xx answer rejects with hapic's `HttpResponseError` (a `ClientError`, so `isClientError()` matches);
  when the body has a string `message`, the error's `message` is replaced by it.

## Wakeup subscription

`message.subscribe()` reads the caller's `GET /messages/stream` (Server-Sent Events) and yields typed wakeups. A wakeup
carries only the recipient, never a payload: on each one, `pull()` the mailbox. The hub sends one wakeup right after
connecting, so a fresh subscription also catches up on anything already queued.

```typescript
import { Client } from '@privateaim/messenger-http-kit';
import { WakeupEventName } from '@privateaim/messenger-kit';

declare const client: Client;

const controller = new AbortController();

for await (const event of client.message.subscribe({ signal: controller.signal })) {
    if (event.type === WakeupEventName.MESSAGE_PENDING) {
        const { messages } = await client.message.pull();
        // ... process, then ack
    }
}
```

- **Events.** `MessageStreamEvent` is discriminated by `type`; today it has one member, `messagePending` with
  `data: MessagePendingEvent` (`{ recipient }`). `lastEventId` and `retry` carry the stream's last `id` / `retry`
  fields (the hub sends neither today).
- **Skipped.** Keep-alive comments, event types the client does not know, and a `messagePending` whose data is not a
  wakeup payload.
- **No deadline.** The request is sent with `timeout: 0`, so a client-level `timeout` does not cut the open-ended
  stream. Bound it with the `signal`; a `timeout` passed to `subscribe()` replaces the `0` and cuts the stream.
- **Abort.** Aborting the signal, or `break`ing out of the loop, closes the connection and ends the iteration without
  an error. A non-2xx answer rejects with hapic's `ClientError`.
- **No reconnect.** One response is read. When the loop ends without an abort, the server closed the stream:
  reconnect (with your own backoff), then pull once. The durable mailbox loses nothing across the gap, so no
  `Last-Event-ID` replay is needed.
- **Lazy.** The request is sent on the first iteration, not when `subscribe()` is called.

`toMessageStreamEvent(message)` and `isMessagePendingEvent(input)` are the parsing steps `subscribe()` uses, exported
for a consumer that reads the stream itself.

## Contract

`Client` implements `IMessengerClient` and `MessageAPI` implements `IMessageAPI`. Depend on the contract rather than
the class:

```typescript
import type { IMessengerClient } from '@privateaim/messenger-http-kit';

export async function drain(client: IMessengerClient): Promise<number> {
    const { messages } = await client.message.pull();

    if (messages.length > 0) {
        await client.message.ack({ ids: messages.map((message) => message.id) });
    }

    return messages.length;
}
```

| Sub-API | Contract | Methods |
|---|---|---|
| `message` | `IMessageAPI` | `send` / `pull` / `ack` / `subscribe` |

`MessageAPI` extends hapic's `BaseAPI`; `IMessengerClient` extends hapic's `IClient`.

## Testing

`@privateaim/messenger-http-kit/testing` ships a `FakeClient`: a real `Client` on hapic's `MemoryTransport`. Only the
transport is replaced, so header merging, body transformation, decoding, retries and the client's own error hook all
run unchanged, and no network is touched.

```typescript
import { createFakeClient, fakeResponse } from '@privateaim/messenger-http-kit/testing';

const client = createFakeClient({
    handlers: {
        'GET /messages': () => ({ messages: [{ id: 'm1' }] }),
        'POST /messages/ack': () => fakeResponse(400, { message: 'At least one message id is required.' }),
    },
});

const { messages } = await client.message.pull({ limit: 5 });

// Every dispatched request is recorded, normalized.
console.log(client.requests[0].url); // 'http://fake.test/messages?limit=5'
```

- Handler keys are `'<METHOD> /<path>'`; a `:name` segment captures into `request.params`.
- The query string is ignored for matching, and `'*'` is a catch-all that always loses to a specific pattern. Among
  specific patterns the first match in insertion order wins.
- A handler returns the response **body**, which the fake answers with a 200. Return `fakeResponse(status, body)` for
  a non-2xx; it runs through the real error pipeline.
- Without a matching handler, `fallback` answers (default: `{ data: [], meta: { total: 0 } }`).
- Keep the default path-free `baseURL` (`http://fake.test`). A `baseURL` carrying a path shifts every pathname, and
  patterns silently stop matching.
- `client.requests` holds each request's `method`, `url`, parsed `body`, `params`, lower-cased `headers`, and
  `options`: the `signal` and `timeout` it was sent with (client defaults included, so `subscribe()` shows
  `timeout: 0`), each key only when set.

To test a consumer of `subscribe()`, serve a `FakeEventStream`: an open `text/event-stream` response you feed by
hand.

```typescript
import { FakeEventStream, createFakeClient } from '@privateaim/messenger-http-kit/testing';

const stream = new FakeEventStream();
const client = createFakeClient({ handlers: { 'GET /messages/stream': () => stream.response } });

stream.write('event: messagePending\ndata: {"recipient":{"type":"client","id":"c1"}}\n\n');
stream.close(); // ends the subscription; omit it to keep the stream open

for await (const event of client.message.subscribe()) {
    console.log(event.data.recipient.id); // 'c1'
}

// stream.cancelled turns true once the consumer aborts or breaks out of the loop
```

A handler `Response` is tied to the request's signal as `fetch` does, so an abort or a hapic `timeout` errors the body
and cancels the source. Serve one `FakeEventStream` per request: a body is read once.

## API

| Export | Kind | Purpose |
|---|---|---|
| `Client` | class | The messenger HTTP client |
| `IMessengerClient` / `ClientOptions` | types | The client contract and its construction options (hapic's `ClientOptionsInput`) |
| `MessageAPI` / `IMessageAPI` | class / interface | The message sub-API and its contract |
| `MessageStreamEvent` / `MessageSubscribeOptions` | types | The typed wakeup `subscribe()` yields and its options |
| `APIRequestOptions` | type | The per-call `{ signal?, timeout? }` every method takes last |
| `toMessageStreamEvent` / `isMessagePendingEvent` | functions | Turn a parsed SSE message into a typed wakeup (or `undefined`); guard a wakeup payload |
| `./testing` | subpath | `FakeClient`, `createFakeClient`, `fakeResponse`, `matchRoute`, `FakeEventStream` and their types |

## Notes

- **Not an entity API.** Unlike the core, storage and telemetry clients, nothing here carries the `{ data, meta }`
  envelope, and `pull` takes plain `limit` / `wait` parameters rather than a rapiq query. `send` unwraps the server's
  `{ data: ids }` into a plain array.
- **Delivery is at least once.** A message is deleted only by `ack`; a crash between pull and ack returns it again.
  Deduplicate on `message.id`.
- **`subscribe()` does not reconnect.** Write the reconnect loop yourself and pull once after every reconnect.

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
