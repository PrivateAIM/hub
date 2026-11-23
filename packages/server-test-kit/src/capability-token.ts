/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { exchangeAuthupToken } from '@privateaim/server-kit';
import type { CapabilityTokenInput } from './types.ts';

/**
 * Mint a capability token through the (test) Authup, exchanging `subjectToken`
 * as the built-in `system` client. The suite has to provision the exchange
 * (`provideAuthup(..., { tokenExchange })`) for the audience.
 */
export async function createCapabilityToken(input: CapabilityTokenInput): Promise<string> {
    const baseURL = process.env.AUTHUP_URL;

    if (!baseURL) {
        throw new Error('The AUTHUP_URL is not configured — cannot mint a capability token.');
    }

    const result = await exchangeAuthupToken(
        {
            baseURL,
            clientId: 'system',
            clientSecret: 'start123',
            realm: 'master',
        },
        {
            subjectToken: input.subjectToken,
            audience: input.audience ?? 'storage',
            cap: input.cap,
            expiresIn: input.expiresIn,
        },
    );

    return result.token;
}
