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

    /**
     * Credential confusion: authup's introspection falls back to the token in
     * the request's own `Authorization` header when the body `token` fails its
     * validator (too short, too long), and hub's verifier inherits its own
     * service credentials onto that header — so a malformed bearer was
     * reported as the hub `system` client and answered 200.
     */
    it.each([
        ['a short garbage bearer', 'not-a-token'],
        ['an oversized bearer', 'x'.repeat(4096)],
        ['a JWS-shaped bearer shorter than 16 characters', 'a.b.c'],
        ['a JWS-shaped bearer longer than 2048 characters', `aaaa.bbbb.${'c'.repeat(2100)}`],
    ])('answers 401 for %s', async (_label, token) => {
        const response = await fetch(`${app.baseURL}messages`, { headers: { authorization: `Bearer ${token}` } });

        expect(response.status).toBe(401);
    });

    it('answers 401 for a garbage token in the cookie fallback', async () => {
        const response = await fetch(`${app.baseURL}messages`, { headers: { cookie: 'access_token=not-a-token' } });

        expect(response.status).toBe(401);
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
