/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { WakeupEventName } from '@privateaim/messenger-kit';
import type { MessageStreamEvent } from '@privateaim/messenger-http-kit';
import { createAdminAccessToken } from '@privateaim/server-test-kit';
import { createTestApplication } from '../../../app/factory.ts';
import type { TestHTTPApplication } from '../../../app/http.ts';
import { resolveTokenSubject } from '../../../utils/index.ts';

describe('adapters/http/message', () => {
    let app: TestHTTPApplication;
    let adminToken: string;
    // the admin/master user the authenticated test client acts as
    let SELF_ID: string;

    beforeAll(async () => {
        app = createTestApplication();
        await app.setup();

        adminToken = await createAdminAccessToken();
        SELF_ID = await resolveTokenSubject(adminToken);

        // drain the admin identity's mailbox until empty so the round-trip
        // is deterministic on the shared/persistent CI database (backlog may exceed one page)
        for (;;) {
            const leftover = await app.client.message.pull({ limit: 100 });

            if (leftover.messages.length === 0) {
                break;
            }

            await app.client.message.ack({ ids: leftover.messages.map((m) => m.id) });
        }
    });

    afterAll(async () => {
        await app.teardown();
    });

    it('should send, pull and ack over HTTP', async () => {
        const { client } = app;

        const ids = await client.message.send({
            recipients: [{ type: 'user', id: SELF_ID }],
            data: 'hello over http',
            metadata: { analysisId: 'analysis-1' },
        });

        expect(ids).toHaveLength(1);

        const pulled = await client.message.pull();

        expect(pulled.messages).toHaveLength(1);
        expect(pulled.messages[0].data).toBe('hello over http');
        expect(pulled.messages[0].senderId).toBe(SELF_ID);
        expect(pulled.messages[0].metadata).toEqual({ analysisId: 'analysis-1' });

        await client.message.ack({ ids: pulled.messages.map((m) => m.id) });

        const after = await client.message.pull();

        expect(after.messages).toHaveLength(0);
    });

    it('should open an SSE stream and emit a messagePending wakeup on connect', async () => {
        const res = await fetch(`${app.baseURL}messages/stream`, {
            headers: {
                accept: 'text/event-stream',
                authorization: `Bearer ${adminToken}`,
            },
        });

        expect(res.status).toBe(200);
        expect(res.headers.get('content-type')).toContain('text/event-stream');

        if (!res.body) {
            throw new Error('expected an SSE response body');
        }

        const reader = res.body.getReader();
        const { value } = await reader.read();
        const text = new TextDecoder().decode(value);

        await reader.cancel();

        expect(text).toContain(WakeupEventName.MESSAGE_PENDING);
    });

    it('should deliver typed messagePending wakeups through the kit subscription', async () => {
        const { client } = app;
        const controller = new AbortController();
        const events: MessageStreamEvent[] = [];

        for await (const event of client.message.subscribe({ signal: controller.signal })) {
            events.push(event);

            if (events.length === 1) {
                // the on-connect wakeup: the stream is open, so a send now must wake it
                await client.message.send({ recipients: [{ type: 'user', id: SELF_ID }], data: 'wake up' });

                continue;
            }

            controller.abort();
        }

        expect(events).toHaveLength(2);

        for (const event of events) {
            expect(event.type).toBe(WakeupEventName.MESSAGE_PENDING);
            expect(event.data).toEqual({ recipient: { type: 'user', id: SELF_ID } });
        }

        const pulled = await client.message.pull();

        expect(pulled.messages.map((m) => m.data)).toEqual(['wake up']);

        await client.message.ack({ ids: pulled.messages.map((m) => m.id) });
    });

    it('should keep the stream alive with a comment that never surfaces as an event', async () => {
        // the heartbeat interval is fixed (15 s); wait one beat on a raw and a kit stream
        const beat = AbortSignal.timeout(16_500);

        const raw = await fetch(`${app.baseURL}messages/stream`, {
            headers: { accept: 'text/event-stream', authorization: `Bearer ${adminToken}` },
            signal: beat,
        });

        const rawBody = raw.body;

        if (!rawBody) {
            throw new Error('expected an SSE response body');
        }

        const readRaw = async (): Promise<string> => {
            const decoder = new TextDecoder();
            let text = '';

            try {
                for await (const chunk of rawBody) {
                    text += decoder.decode(chunk, { stream: true });
                }
            } catch {
                // the beat closed the stream
            }

            return text;
        };

        const readKit = (): Promise<MessageStreamEvent[]> => Array.fromAsync(app.client.message.subscribe({ signal: beat }));

        const [text, events] = await Promise.all([readRaw(), readKit()]);

        expect(text).toMatch(/^: ?ping$/m);
        expect(text).not.toContain('event: ping');
        // only the on-connect wakeup; the heartbeat yielded nothing
        expect(events.map((event) => event.type)).toEqual([WakeupEventName.MESSAGE_PENDING]);
    }, 30_000);
});
