/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildAuthupURL } from '@privateaim/server-test-kit';

/**
 * Resolve the subject (`sub`) of an access token by introspecting it against
 * the test Authup — the id server-messenger addresses that identity's mailbox
 * by.
 */
export async function resolveTokenSubject(token: string, baseURL = process.env.AUTHUP_URL): Promise<string> {
    if (!baseURL) {
        throw new Error('The AUTHUP_URL is not configured — cannot introspect the access token.');
    }

    const response = await fetch(buildAuthupURL(baseURL, 'token/introspect'), {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
    });

    if (!response.ok) {
        throw new Error(`Authup token introspection failed (${response.status}).`);
    }

    const body: { active?: boolean, sub?: string } = await response.json();
    if (!body.active || !body.sub) {
        throw new Error('Authup reported the access token as inactive.');
    }

    return body.sub;
}
