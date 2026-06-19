/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthupClient } from '@privateaim/server-kit';
import { describe, expect, it } from 'vitest';
import { AuthupClientCredentialReader } from '../../../../../src/app/modules/database/authup-client-credential-reader.ts';

describe('AuthupClientCredentialReader', () => {
    it('should fetch the client with the +secret field and map id/secret', async () => {
        const calls: { id: string; options?: any }[] = [];
        const authup = {
            client: {
                getOne: async (id: string, options?: any) => {
                    calls.push({ id, options });
                    return { id, secret: 'sek' };
                },
            },
        };

        const reader = new AuthupClientCredentialReader(authup as unknown as AuthupClient);
        const result = await reader.readByClientId('client-1');

        expect(result).toEqual({ id: 'client-1', secret: 'sek' });
        expect(calls[0]).toEqual({ id: 'client-1', options: { fields: ['+secret'] } });
    });

    it('should null a missing secret', async () => {
        const authup = { client: { getOne: async (id: string) => ({ id, secret: undefined }) } };

        const reader = new AuthupClientCredentialReader(authup as unknown as AuthupClient);
        const result = await reader.readByClientId('client-2');

        expect(result).toEqual({ id: 'client-2', secret: null });
    });
});
