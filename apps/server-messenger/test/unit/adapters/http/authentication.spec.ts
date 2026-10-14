/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createRestrictedAccessToken } from '@privateaim/server-test-kit';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { createTestApplication } from '../../../app/factory.ts';
import type { TestHTTPApplication } from '../../../app/http.ts';
import { resolveTokenSubject } from '../../../utils/index.ts';

/**
 * server-messenger never registered an Authup client, so its authorization
 * middleware took the no-Authup fallback in production and attached one fixed
 * master-realm user to EVERY request: no token was needed, and every caller
 * read and acked the same mailbox.
 */
describe('adapters/http/message authentication', () => {
    let app: TestHTTPApplication;
    let aliceToken: string;
    let bobToken: string;
    let bobId: string;

    beforeAll(async () => {
        app = createTestApplication();
        await app.setup();

        aliceToken = await createRestrictedAccessToken();
        bobToken = await createRestrictedAccessToken();
        bobId = await resolveTokenSubject(bobToken);
    });

    afterAll(async () => {
        await app.teardown();
    });

    it('answers 401 for a request without a token', async () => {
        const response = await fetch(`${app.baseURL}messages`);

        expect(response.status).toBe(401);
    });

    // Negative control for the 401: the same route answers 200 once the
    // request carries a token, so the 401 is the missing identity and not a
    // broken route.
    it('answers 200 for the same request with a token', async () => {
        const response = await fetch(`${app.baseURL}messages`, { headers: { authorization: `Bearer ${bobToken}` } });

        expect(response.status).toBe(200);
    });

    it('delivers to the recipient only, not to every caller', async () => {
        const alice = app.createClient(aliceToken);
        const bob = app.createClient(bobToken);

        const [id] = await alice.message.send({
            recipients: [{ type: 'user', id: bobId }],
            data: 'for bob only',
        });

        // Negative control: the recipient does see it, so the empty pull
        // below is isolation, not a message that never arrived.
        const forBob = await bob.message.pull();
        expect(forBob.messages.map((m) => m.id)).toContain(id);

        const forAlice = await alice.message.pull();
        expect(forAlice.messages.map((m) => m.id)).not.toContain(id);
    });
});
