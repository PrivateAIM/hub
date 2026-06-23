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
import { createTestApplication } from '../../../app/factory.ts';
import type { TestHTTPApplication } from '../../../app/http.ts';

// the identity injected by the fake auth path (no Authup in tests)
const SELF_ID = 'd94b2f28-29e3-4ced-b8f1-6923a01dc1ee';

describe('adapters/http/message', () => {
    let app: TestHTTPApplication;

    beforeAll(async () => {
        app = createTestApplication();
        await app.setup();

        // drain the fixed fake identity's mailbox until empty so the round-trip
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
        expect(pulled.messages[0].sender_id).toBe(SELF_ID);
        expect(pulled.messages[0].metadata).toEqual({ analysisId: 'analysis-1' });

        await client.message.ack({ ids: pulled.messages.map((m) => m.id) });

        const after = await client.message.pull();
        expect(after.messages).toHaveLength(0);
    });

    it('should open an SSE stream and emit a messagePending wakeup on connect', async () => {
        const res = await fetch(`${app.baseURL}messages/stream`, { headers: { accept: 'text/event-stream' } });

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
});
