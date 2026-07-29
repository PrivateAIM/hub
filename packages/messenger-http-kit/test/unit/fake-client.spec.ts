/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientError } from 'hapic';
import { describe, expect, it } from 'vitest';
import { createFakeClient, fakeResponse, matchRoute } from '../../src/testing';

describe('matchRoute', () => {
    it('should ignore the query string', () => {
        const match = matchRoute('GET', '/messages?limit=5&wait=10', { 'GET /messages': () => 'hit' });

        expect(match).toBeDefined();
    });

    it('should let a specific pattern beat a preceding catch-all', () => {
        const match = matchRoute('POST', '/messages/ack', {
            '*': () => 'catch-all',
            'POST /messages/ack': () => 'specific',
        });

        expect(match.handler({} as any)).toBe('specific');
    });
});

describe('FakeClient', () => {
    it('should pull messages and record the query string', async () => {
        const client = createFakeClient({ handlers: { 'GET /messages': () => ({ messages: [{ id: 'm1' }] }) } });

        const response = await client.message.pull({ limit: 5, wait: 10 });

        expect(response.messages).toEqual([{ id: 'm1' }]);
        expect(client.requests[0].url).toContain('limit=5');
        expect(client.requests[0].url).toContain('wait=10');
    });

    it('should send messages and return the persisted ids', async () => {
        const client = createFakeClient({ handlers: { 'POST /messages': () => ({ data: ['m1', 'm2'] }) } });

        const ids = await client.message.send({ recipients: ['r1'], payload: {} } as any);

        expect(ids).toEqual(['m1', 'm2']);
        expect(client.requests[0].body).toMatchObject({ recipients: ['r1'] });
    });

    it('should acknowledge messages by id', async () => {
        const client = createFakeClient({ handlers: { 'POST /messages/ack': () => undefined } });

        await client.message.ack({ ids: ['m1'] } as any);

        expect(client.requests[0]).toMatchObject({ method: 'POST', body: { ids: ['m1'] } });
    });

    it('should drive a non-2xx through the real error pipeline, hook included', async () => {
        const client = createFakeClient({ handlers: { 'POST /messages': () => fakeResponse(403, { message: 'rewritten by server' }) } });

        await expect(client.message.send({ recipients: [], payload: {} } as any)).rejects.toSatisfy(
            (error: unknown) => isClientError(error) &&
                error.response?.status === 403 &&
                error.message === 'rewritten by server',
        );
    });

    it('should expose client-level default headers in the recorded request', async () => {
        const client = createFakeClient({ handlers: { 'GET /messages': () => ({ messages: [] }) } });

        client.setAuthorizationHeader({ type: 'Bearer', token: 'abc' });
        await client.message.pull();

        expect(client.requests[0].headers.authorization).toBe('Bearer abc');
    });
});
