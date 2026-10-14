/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isUnauthorizedError } from '@privateaim/errors';
import { describe, expect, it } from 'vitest';
import { createAuthupTokenVerifier } from '../../../../src/middlewares/authup/token-verifier.ts';

/**
 * authup reports a malformed introspected token as the CALLING service's own
 * client (authup#3724), so the verifier every service builds must refuse it
 * before introspection — no token is ever minted for the call.
 */
describe('createAuthupTokenVerifier', () => {
    it('refuses a malformed token before introspecting it', async () => {
        let minted = 0;
        const verifier = createAuthupTokenVerifier({
            baseURL: 'http://authup.invalid',
            creator: async () => {
                minted += 1;
                throw new Error('introspection must not be reached');
            },
        });

        const error = await verifier.verify('not-a-token').then(() => undefined, (e: unknown) => e);

        expect(isUnauthorizedError(error)).toBe(true);
        expect(minted).toBe(0);
    });
});
