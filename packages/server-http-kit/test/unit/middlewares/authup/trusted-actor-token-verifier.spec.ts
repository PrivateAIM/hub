/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ITokenVerifier, TokenVerificationData } from '@authup/server-adapter-kit';
import { UnauthorizedError, isHubError } from '@privateaim/errors';
import { describe, expect, it } from 'vitest';
import { TrustedActorTokenVerifier } from '../../../../src/middlewares/authup/trusted-actor-token-verifier.ts';

const TRUSTED_CLIENT_ID = '00000000-0000-4000-8000-000000000001';
const OTHER_CLIENT_ID = '00000000-0000-4000-8000-000000000002';

class FakeTokenVerifier implements ITokenVerifier {
    constructor(protected data: Partial<TokenVerificationData>) {}

    async verify(): Promise<TokenVerificationData> {
        return { permissions: [], ...this.data } as TokenVerificationData;
    }
}

function createVerifier(data: Partial<TokenVerificationData>, resolve: () => Promise<string> = async () => TRUSTED_CLIENT_ID) {
    return new TrustedActorTokenVerifier(new FakeTokenVerifier(data), resolve);
}

describe('TrustedActorTokenVerifier', () => {
    it('accepts a token exchanged by the trusted client', async () => {
        const verifier = createVerifier({ act: { sub: TRUSTED_CLIENT_ID, sub_kind: 'client' } });

        await expect(verifier.verify('token')).resolves.toMatchObject({ act: { sub: TRUSTED_CLIENT_ID } });
    });

    it('refuses a token exchanged by another client', async () => {
        const verifier = createVerifier({ act: { sub: OTHER_CLIENT_ID, sub_kind: 'client' } });

        await expect(verifier.verify('token')).rejects.toThrow(UnauthorizedError);
    });

    it('refuses a token without an actor', async () => {
        const verifier = createVerifier({});

        await expect(verifier.verify('token')).rejects.toThrow(UnauthorizedError);
    });

    it('answers 502 while the trusted client cannot be resolved and retries later', async () => {
        let calls = 0;
        const verifier = createVerifier(
            { act: { sub: TRUSTED_CLIENT_ID, sub_kind: 'client' } },
            async () => {
                calls++;

                if (calls === 1) {
                    throw new Error('authup down');
                }

                return TRUSTED_CLIENT_ID;
            },
        );

        const error = await verifier.verify('token').then(() => undefined, (e: unknown) => e);

        expect(isHubError(error)).toBe(true);
        expect(error).toMatchObject({ status: 502 });

        await expect(verifier.verify('token')).resolves.toBeDefined();
        await expect(verifier.verify('token')).resolves.toBeDefined();
        expect(calls).toBe(2);
    });
});
