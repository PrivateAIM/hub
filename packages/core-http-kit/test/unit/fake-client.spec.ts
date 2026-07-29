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
    it('should match an exact path', () => {
        const match = matchRoute('GET', '/projects', { 'GET /projects': () => 'hit' });

        expect(match).toBeDefined();
        expect(match.params).toEqual({});
    });

    it('should capture :param segments', () => {
        const match = matchRoute('GET', '/projects/abc/nodes/xyz', { 'GET /projects/:projectId/nodes/:nodeId': () => 'hit' });

        expect(match.params).toEqual({ projectId: 'abc', nodeId: 'xyz' });
    });

    it('should discriminate on method, case-insensitively', () => {
        const handlers = { 'delete /projects/:id': () => 'del' };

        expect(matchRoute('DELETE', '/projects/abc', handlers)).toBeDefined();
        expect(matchRoute('GET', '/projects/abc', handlers)).toBeNull();
    });

    it('should ignore the query string and normalize absolute urls', () => {
        const handlers = { 'GET /projects': () => 'hit' };

        expect(matchRoute('GET', '/projects?filter[name]=a', handlers)).toBeDefined();
        expect(matchRoute('GET', 'http://fake.test/projects?limit=5', handlers)).toBeDefined();
    });

    it('should require an equal segment count', () => {
        expect(matchRoute('GET', '/projects/abc/extra', { 'GET /projects/:id': () => 'hit' })).toBeNull();
    });

    it('should let a specific pattern beat a PRECEDING catch-all', () => {
        const match = matchRoute('GET', '/projects', {
            '*': () => 'catch-all',
            'GET /projects': () => 'specific',
        });

        expect(match.handler(EMPTY_REQUEST)).toBe('specific');
    });

    it('should fall back to the catch-all when nothing specific matches', () => {
        const match = matchRoute('GET', '/unknown', { '*': () => 'catch-all' });

        expect(match.handler(EMPTY_REQUEST)).toBe('catch-all');
    });

    it('should skip a key without a space separator', () => {
        expect(matchRoute('GET', '/projects', { '/projects': () => 'hit' })).toBeNull();
    });
});

describe('FakeClient', () => {
    it('should answer a matched route and record the request', async () => {
        const client = createFakeClient({ handlers: { 'GET /projects/:id': (req) => ({ data: { id: req.params.id, name: 'demo' }, meta: {} }) } });

        const response = await client.project.getOne('abc');

        expect(response.data).toEqual({ id: 'abc', name: 'demo' });
        expect(client.requests).toHaveLength(1);
        expect(client.requests[0]).toMatchObject({ method: 'GET', params: { id: 'abc' } });
        expect(client.requests[0].url).toContain('/projects/abc');
    });

    it('should parse a JSON request body back into an object', async () => {
        const client = createFakeClient({ handlers: { 'POST /projects': () => ({ data: { id: 'new' }, meta: {} }) } });

        await client.project.create({ name: 'foo', description: 'bar' });

        expect(client.requests[0].body).toEqual({ name: 'foo', description: 'bar' });
    });

    it('should use the fallback when nothing matches, and default it to an empty collection', async () => {
        const client = createFakeClient();

        const response = await client.project.getMany();

        expect(response).toEqual({ data: [], meta: { total: 0 } });
        expect(client.requests).toHaveLength(1);
    });

    it('should support an async handler', async () => {
        const client = createFakeClient({
            handlers: {
                'GET /projects': async () => {
                    await Promise.resolve();
                    return { data: [{ id: 'a' }], meta: { total: 1 } };
                },
            },
        });

        const response = await client.project.getMany();

        expect(response.meta.total).toBe(1);
    });

    it('should dispatch a responseType:stream request as GET', async () => {
        // hapic dispatches `client.request({ url, responseType: 'stream' })`
        // with `method === undefined`; the fake must normalize it to GET or
        // AnalysisAPI.streamFiles/downloadResult never match a route.
        const client = createFakeClient({ handlers: { 'GET /analyses/:id/files/download': () => 'stream-body' } });

        await client.analysis.streamFiles('abc');

        expect(client.requests[0]).toMatchObject({ method: 'GET', params: { id: 'abc' } });
    });

    it('should drive a non-2xx through the real error pipeline, hook included', async () => {
        const client = createFakeClient({ handlers: { 'GET /projects/:id': () => fakeResponse(400, { message: 'rewritten by server' }) } });

        // The constructor's RESPONSE_ERROR hook copies `response.data.message`
        // onto the error — proof the fake did not bypass the client's own hooks.
        await expect(client.project.getOne('abc')).rejects.toSatisfy(
            (error: unknown) => isClientError(error) &&
                error.response?.status === 400 &&
                error.message === 'rewritten by server',
        );
    });

    it('should expose client-level default headers in the recorded request', async () => {
        const client = createFakeClient({ handlers: { 'GET /projects': () => ({ data: [], meta: { total: 0 } }) } });

        client.setAuthorizationHeader({ type: 'Bearer', token: 'abc' });
        await client.project.getMany();

        expect(client.requests[0].headers.authorization).toBe('Bearer abc');
    });

    it('should include a baseURL path prefix in the matched pathname', async () => {
        // Documented footgun: a path-bearing baseURL shifts every pathname, so
        // 'GET /projects' silently falls through to the fallback.
        const client = createFakeClient({
            baseURL: 'http://fake.test/api',
            handlers: { 'GET /projects': () => ({ data: [{ id: 'a' }], meta: { total: 1 } }) },
        });

        const response = await client.project.getMany();

        expect(response).toEqual({ data: [], meta: { total: 0 } });
        expect(client.requests[0].url).toContain('/api/projects');
        expect(client.requests[0].params).toEqual({});
    });
});
