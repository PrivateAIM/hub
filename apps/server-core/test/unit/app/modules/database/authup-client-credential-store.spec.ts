/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AuthupClient } from '@privateaim/server-kit';
import { describe, expect, it } from 'vitest';
import { AuthupClientCredentialStore } from '../../../../../src/app/modules/database/authup-client-credential-store.ts';

describe('AuthupClientCredentialStore', () => {
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

        const reader = new AuthupClientCredentialStore(authup as unknown as AuthupClient);
        const result = await reader.readByClientId('client-1');

        expect(result).toEqual({ id: 'client-1', secret: 'sek' });
        expect(calls[0]).toEqual({ id: 'client-1', options: { fields: ['+secret'] } });
    });

    it('should null a missing secret', async () => {
        const authup = { client: { getOne: async (id: string) => ({ id, secret: undefined }) } };

        const reader = new AuthupClientCredentialStore(authup as unknown as AuthupClient);
        const result = await reader.readByClientId('client-2');

        expect(result).toEqual({ id: 'client-2', secret: null });
    });

    it('should set a provided secret via client update and return the plaintext', async () => {
        const calls: { id: string; data?: any }[] = [];
        const authup = {
            client: {
                update: async (id: string, data?: any) => {
                    calls.push({ id, data });
                    return { id, secret: 'stored-hash' };
                },
            },
        };

        const store = new AuthupClientCredentialStore(authup as unknown as AuthupClient);
        const result = await store.writeByClientId('client-1', 'my-secret');

        expect(calls[0]).toEqual({ id: 'client-1', data: { secret: 'my-secret' } });
        // Returns what we wrote, not the (possibly hashed) stored value.
        expect(result).toEqual({ id: 'client-1', secret: 'my-secret' });
    });

    it('should generate a secret when none is provided and write+return it', async () => {
        const calls: { id: string; data?: any }[] = [];
        const authup = {
            client: {
                update: async (id: string, data?: any) => {
                    calls.push({ id, data });
                    return { id, secret: 'stored-hash' };
                },
            },
        };

        const store = new AuthupClientCredentialStore(authup as unknown as AuthupClient);
        const result = await store.writeByClientId('client-2');

        const written = calls[0].data.secret;
        expect(typeof written).toBe('string');
        expect(written.length).toBeGreaterThan(0);
        expect(result).toEqual({ id: 'client-2', secret: written });
    });
});
