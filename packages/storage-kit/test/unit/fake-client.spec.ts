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
        const match = matchRoute('GET', '/buckets/abc?fields=name', { 'GET /buckets/:id': () => 'hit' });

        expect(match.params).toEqual({ id: 'abc' });
    });

    it('should let a specific pattern beat a preceding catch-all', () => {
        const match = matchRoute('GET', '/buckets', {
            '*': () => 'catch-all',
            'GET /buckets': () => 'specific',
        });

        expect(match.handler(EMPTY_REQUEST)).toBe('specific');
    });
});

describe('FakeClient', () => {
    it('should answer a matched route and record the request', async () => {
        const client = createFakeClient({ handlers: { 'GET /buckets/:id': (req) => ({ data: { id: req.params.id, name: 'demo' }, meta: {} }) } });

        const response = await client.bucket.getOne('abc');

        expect(response.data).toEqual({ id: 'abc', name: 'demo' });
        expect(client.requests[0]).toMatchObject({ method: 'GET', params: { id: 'abc' } });
    });

    it('should parse a JSON request body back into an object', async () => {
        const client = createFakeClient({ handlers: { 'POST /buckets': () => ({ data: { id: 'new' }, meta: {} }) } });

        await client.bucket.create({ name: 'demo' });

        expect(client.requests[0].body).toMatchObject({ name: 'demo' });
    });

    it('should default to an empty collection when nothing matches', async () => {
        const client = createFakeClient();

        expect(await client.bucket.getMany()).toEqual({ data: [], meta: { total: 0 } });
    });

    it('should dispatch a responseType:stream request as GET', async () => {
        // `client.request({ url, responseType: 'stream' })` dispatches with
        // `method === undefined`; without the GET default, BucketFileAPI.stream
        // would never match a route.
        const client = createFakeClient({ handlers: { 'GET /bucket-files/:id/stream': () => 'stream-body' } });

        await client.bucketFile.stream('abc');

        expect(client.requests[0]).toMatchObject({ method: 'GET', params: { id: 'abc' } });
    });

    it('should drive a non-2xx through the real error pipeline, hook included', async () => {
        const client = createFakeClient({ handlers: { 'GET /buckets/:id': () => fakeResponse(404, { message: 'rewritten by server' }) } });

        await expect(client.bucket.getOne('abc')).rejects.toSatisfy(
            (error: unknown) => isClientError(error) &&
                error.response?.status === 404 &&
                error.message === 'rewritten by server',
        );
    });

    it('should expose client-level default headers in the recorded request', async () => {
        const client = createFakeClient({ handlers: { 'GET /buckets': () => ({ data: [], meta: { total: 0 } }) } });

        client.setAuthorizationHeader({ type: 'Bearer', token: 'abc' });
        await client.bucket.getMany();

        expect(client.requests[0].headers.authorization).toBe('Bearer abc');
    });
});
