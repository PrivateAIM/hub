/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { createFakeAuthupClient } from '@privateaim/server-test-kit';
import { describe, expect, it } from 'vitest';
import { AuthupClientCredentialStore } from '../../../../../src/app/modules/database/authup-client-credential-store.ts';

// Driven through a REAL `AuthupClient` on an in-memory transport, so the
// request actually travels the hapic pipeline (query serialization, body
// transform, decode) instead of stopping at a hand-written object literal.

describe('AuthupClientCredentialStore', () => {
    it('should fetch the client with the +secret field and map id/name/display_name/secret', async () => {
        const authup = createFakeAuthupClient({
            handlers: {
                'GET /clients/:id': (req) => ({
                    data: {
                        id: req.params.id,
                        name: 'node-1',
                        displayName: 'Node 1',
                        secret: 'sek',
                    },
                    meta: {},
                }),
            },
        });

        const reader = new AuthupClientCredentialStore(authup);
        const result = await reader.readByClientId('client-1');

        expect(result).toEqual({
            id: 'client-1',
            name: 'node-1',
            display_name: 'Node 1',
            secret: 'sek',
        });

        // `secret` is select:false server-side, so the opt-in must reach the wire.
        expect(decodeURIComponent(authup.requests[0].url)).toContain('+secret');
    });

    it('should null a missing secret and display_name', async () => {
        const authup = createFakeAuthupClient({
            handlers: {
                'GET /clients/:id': (req) => ({
                    data: { id: req.params.id, name: 'node-2' },
                    meta: {},
                }),
            },
        });

        const reader = new AuthupClientCredentialStore(authup);

        expect(await reader.readByClientId('client-2')).toEqual({
            id: 'client-2',
            name: 'node-2',
            display_name: null,
            secret: null,
        });
    });

    it('should set a provided secret via client update and return the plaintext', async () => {
        const authup = createFakeAuthupClient({
            handlers: {
                'POST /clients/:id': (req) => ({
                    data: {
                        id: req.params.id,
                        name: 'node-1',
                        display_name: null,
                        // The stored value may be hashed — the store must NOT
                        // echo it back.
                        secret: 'stored-hash',
                    },
                    meta: {},
                }),
            },
        });

        const store = new AuthupClientCredentialStore(authup);
        const result = await store.writeByClientId('client-1', { secret: 'my-secret' });

        expect(authup.requests[0].body).toMatchObject({ secret: 'my-secret' });
        expect(result).toEqual({
            id: 'client-1',
            name: 'node-1',
            display_name: null,
            secret: 'my-secret',
        });
    });

    it('should generate a secret when none is provided and write+return it', async () => {
        const authup = createFakeAuthupClient({
            handlers: {
                'POST /clients/:id': (req) => ({
                    data: {
                        id: req.params.id,
                        name: 'node-2',
                        display_name: null,
                        secret: 'stored-hash',
                    },
                    meta: {},
                }),
            },
        });

        const store = new AuthupClientCredentialStore(authup);
        const result = await store.writeByClientId('client-2');

        const written = (authup.requests[0].body as Record<string, any>).secret;
        expect(typeof written).toBe('string');
        expect(written.length).toBeGreaterThan(0);
        expect(result).toEqual({
            id: 'client-2',
            name: 'node-2',
            display_name: null,
            secret: written,
        });
    });

    it('should pass name and display_name through to the client update', async () => {
        const authup = createFakeAuthupClient({
            handlers: {
                'POST /clients/:id': (req) => {
                    const body = req.body as Record<string, any>;
                    return {
                        data: {
                            id: req.params.id,
                            name: body.name,
                            displayName: body.displayName ?? null,
                            secret: body.secret,
                        },
                        meta: {},
                    };
                },
            },
        });

        const store = new AuthupClientCredentialStore(authup);
        await store.writeByClientId('client-3', { name: 'renamed', display_name: 'Renamed' });

        const body = authup.requests[0].body as Record<string, any>;
        // An omitted secret still rotates; the labels ride along on the update.
        expect(body.name).toBe('renamed');
        expect(body.displayName).toBe('Renamed');
        expect(typeof body.secret).toBe('string');
        expect(body.secret.length).toBeGreaterThan(0);
    });
});
