/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { WakeupEventName } from '@privateaim/messenger-kit';
import { isClientError, isClientErrorDueTimeout } from 'hapic';
import { describe, expect, it } from 'vitest';
import type { MessageStreamEvent } from '../../src';
import { FakeEventStream, createFakeClient, fakeResponse } from '../../src/testing';

const RECIPIENT = { type: 'client', id: 'c1' };

function pending(extra = '') : string {
    return `${extra}event: ${WakeupEventName.MESSAGE_PENDING}\ndata: ${JSON.stringify({ recipient: RECIPIENT })}\n\n`;
}

function collect(iterable: AsyncIterable<MessageStreamEvent>) : Promise<MessageStreamEvent[]> {
    return Array.fromAsync(iterable);
}

describe('MessageAPI.subscribe', () => {
    it('should request the stream without a deadline and accept an event stream', async () => {
        const stream = new FakeEventStream();
        const client = createFakeClient({ handlers: { 'GET /messages/stream': () => stream.response } });

        stream.close();
        await collect(client.message.subscribe());

        expect(client.requests).toHaveLength(1);
        expect(client.requests[0].method).toBe('GET');
        expect(client.requests[0].headers.accept).toBe('text/event-stream');
    });

    it('should yield typed events with id and retry, skipping comments and pings', async () => {
        const stream = new FakeEventStream();
        const client = createFakeClient({ handlers: { 'GET /messages/stream': () => stream.response } });

        stream.write(': connected\n\n');
        stream.write(pending('id: e1\nretry: 2500\n'));
        stream.write('event: ping\ndata: 1700000000000\n\n');
        stream.write(': ping\n\n');
        stream.write(pending());
        stream.write('event: somethingNew\ndata: {}\n\n');
        stream.close();

        const events = await collect(client.message.subscribe());

        expect(events).toEqual([
            {
                type: WakeupEventName.MESSAGE_PENDING,
                data: { recipient: RECIPIENT },
                lastEventId: 'e1',
                retry: 2500,
            },
            {
                type: WakeupEventName.MESSAGE_PENDING,
                data: { recipient: RECIPIENT },
                // id and retry are stream state: they persist until the server sets them again
                lastEventId: 'e1',
                retry: 2500,
            },
        ]);
    });

    it('should reassemble a message split across chunk boundaries', async () => {
        const stream = new FakeEventStream();
        const client = createFakeClient({ handlers: { 'GET /messages/stream': () => stream.response } });

        const message = pending();
        const cuts = [3, 11, 20, message.length - 1];
        let offset = 0;

        for (const cut of cuts) {
            stream.write(message.slice(offset, cut));
            offset = cut;
        }

        stream.write(message.slice(offset));
        stream.close();

        const events = await collect(client.message.subscribe());

        expect(events).toHaveLength(1);
        expect(events[0].data).toEqual({ recipient: RECIPIENT });
    });

    it('should skip a messagePending whose data is not a wakeup payload', async () => {
        const stream = new FakeEventStream();
        const client = createFakeClient({ handlers: { 'GET /messages/stream': () => stream.response } });

        stream.write(`event: ${WakeupEventName.MESSAGE_PENDING}\ndata: not json\n\n`);
        stream.write(`event: ${WakeupEventName.MESSAGE_PENDING}\ndata: {"recipient":{"type":"client"}}\n\n`);
        stream.write(pending());
        stream.close();

        const events = await collect(client.message.subscribe());

        expect(events).toHaveLength(1);
    });

    it('should end without an error when the signal aborts', async () => {
        const stream = new FakeEventStream();
        const client = createFakeClient({ handlers: { 'GET /messages/stream': () => stream.response } });
        const controller = new AbortController();

        stream.write(pending());

        const events : MessageStreamEvent[] = [];

        for await (const event of client.message.subscribe({ signal: controller.signal })) {
            events.push(event);
            controller.abort();
        }

        expect(events).toHaveLength(1);
        expect(stream.cancelled).toBe(true);
    });

    it('should end without an error when the signal aborts during a pending read', async () => {
        const stream = new FakeEventStream();
        const client = createFakeClient({ handlers: { 'GET /messages/stream': () => stream.response } });

        setTimeout(() => stream.write(pending()), 10);

        const signal = AbortSignal.timeout(50);

        const events = await collect(client.message.subscribe({ signal }));

        expect(events).toHaveLength(1);
        expect(stream.cancelled).toBe(true);
    });

    it('should end without an error when the signal is already aborted', async () => {
        const client = createFakeClient({ handlers: { 'GET /messages/stream': () => new FakeEventStream().response } });

        const events = await collect(client.message.subscribe({ signal: AbortSignal.abort() }));

        expect(events).toEqual([]);
    });

    it('should cancel the response body when the consumer breaks', async () => {
        const stream = new FakeEventStream();
        const client = createFakeClient({ handlers: { 'GET /messages/stream': () => stream.response } });

        stream.write(pending());
        stream.write(pending());

        // what a `break` out of `for await` does: one next(), then return()
        const iterator = client.message.subscribe()[Symbol.asyncIterator]();
        const first = await iterator.next();

        expect(first.value).toMatchObject({ type: WakeupEventName.MESSAGE_PENDING });

        await iterator.return?.(undefined);

        // the cancel travels up the decoder/parser pipes asynchronously
        await expect.poll(() => stream.cancelled).toBe(true);
    });

    it('should not be cut off by a client-level timeout', async () => {
        const stream = new FakeEventStream();
        const client = createFakeClient({
            timeout: 50,
            handlers: { 'GET /messages/stream': () => stream.response },
        });

        stream.write(pending());
        setTimeout(() => {
            stream.write(pending());
            stream.close();
        }, 200);

        const events = await collect(client.message.subscribe());

        expect(events).toHaveLength(2);
    });

    it('should let a client-level timeout cut a plain stream request (fake honours the signal)', async () => {
        const stream = new FakeEventStream();
        const client = createFakeClient({
            timeout: 50,
            handlers: { 'GET /messages/stream': () => stream.response },
        });

        stream.write(pending());

        const response = await client.get('messages/stream', { responseType: 'stream' });

        if (!(response.data instanceof ReadableStream)) {
            throw new TypeError('expected a stream body');
        }

        const reader = response.data.getReader();

        await reader.read();
        await expect(reader.read()).rejects.toSatisfy(
            (error: unknown) => error instanceof DOMException && error.name === 'TimeoutError',
        );
        expect(stream.cancelled).toBe(true);
    });

    it('should reject with the client error on a non-2xx', async () => {
        const client = createFakeClient({ handlers: { 'GET /messages/stream': () => fakeResponse(401, { message: 'unauthorized' }) } });

        await expect(collect(client.message.subscribe())).rejects.toSatisfy(
            (error: unknown) => isClientError(error) &&
                error.response?.status === 401 &&
                !isClientErrorDueTimeout(error),
        );
    });
});
