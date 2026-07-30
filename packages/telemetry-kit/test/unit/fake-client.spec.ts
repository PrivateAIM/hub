/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { isClientError } from 'hapic';
import { describe, expect, it } from 'vitest';
import { createFakeClient, fakeResponse, matchRoute } from '../../src/testing';
import type { FakeRequest } from '../../src/testing';

const EMPTY_REQUEST : FakeRequest = {
    method: 'GET',
    url: '/',
    params: {},
    headers: {},
};

describe('matchRoute', () => {
    it('should capture :param segments and ignore the query string', () => {
        const match = matchRoute('GET', '/events/abc?fields=name', { 'GET /events/:id': () => 'hit' });

        expect(match.params).toEqual({ id: 'abc' });
    });

    it('should let a specific pattern beat a preceding catch-all', () => {
        const match = matchRoute('GET', '/logs', {
            '*': () => 'catch-all',
            'GET /logs': () => 'specific',
        });

        expect(match.handler(EMPTY_REQUEST)).toBe('specific');
    });
});

describe('FakeClient', () => {
    it('should answer a matched route and record the request', async () => {
        const client = createFakeClient({ handlers: { 'GET /events/:id': (req) => ({ data: { id: req.params.id }, meta: {} }) } });

        const response = await client.event.getOne('abc');

        expect(response.data).toEqual({ id: 'abc' });
        expect(client.requests[0]).toMatchObject({ method: 'GET', params: { id: 'abc' } });
    });

    it('should parse a JSON request body back into an object', async () => {
        const client = createFakeClient({ handlers: { 'POST /logs': () => ({ data: { id: 'new' }, meta: {} }) } });

        await client.log.create({
            message: 'hello', 
            level: 'info', 
            service: 'test', 
            channel: 'audit',
        });

        expect(client.requests[0].body).toMatchObject({ message: 'hello' });
    });

    it('should default to an empty collection when nothing matches', async () => {
        const client = createFakeClient();

        expect(await client.log.getMany()).toEqual({ data: [], meta: { total: 0 } });
    });

    it('should record a query-keyed deleteMany', async () => {
        const client = createFakeClient({ handlers: { 'DELETE /logs': () => undefined } });

        await client.log.deleteMany();

        expect(client.requests[0]).toMatchObject({ method: 'DELETE' });
    });

    it('should drive a non-2xx through the real error pipeline, hook included', async () => {
        const client = createFakeClient({ handlers: { 'GET /events/:id': () => fakeResponse(404, { message: 'rewritten by server' }) } });

        await expect(client.event.getOne('abc')).rejects.toSatisfy(
            (error: unknown) => isClientError(error) &&
                error.response?.status === 404 &&
                error.message === 'rewritten by server',
        );
    });

    it('should expose client-level default headers in the recorded request', async () => {
        const client = createFakeClient({ handlers: { 'GET /logs': () => ({ data: [], meta: { total: 0 } }) } });

        client.setAuthorizationHeader({ type: 'Bearer', token: 'abc' });
        await client.log.getMany();

        expect(client.requests[0].headers.authorization).toBe('Bearer abc');
    });
});
