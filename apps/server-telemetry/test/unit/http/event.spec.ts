/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { createAdminAuthorizationHeader } from '@privateaim/server-test-kit';
import { createTestSuite } from '../../utils';

describe('event HTTP endpoints', () => {
    const suite = createTestSuite();
    let baseURL: string;
    let authorization: string;

    beforeAll(async () => {
        await suite.setup();
        baseURL = suite.client().getBaseURL().replace(/\/+$/, '');
        authorization = await createAdminAuthorizationHeader();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    const eventPayload = {
        scope: 'entity',
        name: 'updated',
        refType: 'project',
        refId: '4b324d99-1984-4081-a47d-10e809092075',
        data: { diff: { name: { next: 'new', previous: 'old' } } },
        expiring: true,
        requestPath: '/projects/4b324d99-1984-4081-a47d-10e809092075',
        requestMethod: 'POST',
        requestIpAddress: '0000:0000:0000:0000:0000:ffff:255.255.255.255',
        requestUserAgent: 'TestAgent/1.0',
        actorType: 'user',
        actorId: '9b921a45-3846-40ed-a392-deb26a4cc757',
        actorName: 'admin',
    };

    let createdId: string;

    describe('POST /events', () => {
        it('should create event with 201 status', async () => {
            const response = await fetch(`${baseURL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authorization,
                },
                body: JSON.stringify(eventPayload),
            });

            expect(response.status).toBe(201);
        });

        it('should return event entity with id and timestamps', async () => {
            const response = await fetch(`${baseURL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authorization,
                },
                body: JSON.stringify(eventPayload),
            });

            const body = await response.json();
            expect(body.meta).toEqual({});
            expect(body.data.id).toBeDefined();
            expect(body.data.createdAt).toBeDefined();
            expect(body.data.updatedAt).toBeDefined();

            createdId = body.data.id;
        });

        it('should persist all provided fields', async () => {
            const response = await fetch(`${baseURL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authorization,
                },
                body: JSON.stringify(eventPayload),
            });

            const body = await response.json();
            expect(body.data.scope).toBe(eventPayload.scope);
            expect(body.data.name).toBe(eventPayload.name);
            expect(body.data.refType).toBe(eventPayload.refType);
            expect(body.data.refId).toBe(eventPayload.refId);
            expect(body.data.data).toEqual(eventPayload.data);
            expect(body.data.expiring).toBe(eventPayload.expiring);
            expect(body.data.requestPath).toBe(eventPayload.requestPath);
            expect(body.data.requestMethod).toBe(eventPayload.requestMethod);
            expect(body.data.requestIpAddress).toBe(eventPayload.requestIpAddress);
            expect(body.data.requestUserAgent).toBe(eventPayload.requestUserAgent);
            expect(body.data.actorType).toBe(eventPayload.actorType);
            expect(body.data.actorId).toBe(eventPayload.actorId);
            expect(body.data.actorName).toBe(eventPayload.actorName);

            createdId = body.data.id;
        });
    });

    describe('GET /events', () => {
        it('should return collection with data array and meta', async () => {
            const response = await fetch(`${baseURL}/events`, {
                method: 'GET',
                headers: { Authorization: authorization },
            });

            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body.data).toBeDefined();
            expect(Array.isArray(body.data)).toBe(true);
            expect(body.meta).toBeDefined();
        });

        it('should contain created event in collection', async () => {
            const response = await fetch(`${baseURL}/events`, {
                method: 'GET',
                headers: { Authorization: authorization },
            });

            const body = await response.json();
            const found = body.data.find((e: any) => e.id === createdId);
            expect(found).toBeDefined();
            expect(found.scope).toBe(eventPayload.scope);
            expect(found.name).toBe(eventPayload.name);
        });
    });

    describe('GET /events/:id', () => {
        it('should return single event by id', async () => {
            const response = await fetch(`${baseURL}/events/${createdId}`, {
                method: 'GET',
                headers: { Authorization: authorization },
            });

            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body.data.id).toBe(createdId);
            expect(body.data.scope).toBe(eventPayload.scope);
            expect(body.data.name).toBe(eventPayload.name);
            expect(body.data.refType).toBe(eventPayload.refType);
            expect(body.data.refId).toBe(eventPayload.refId);
            expect(body.meta.schema).toBeDefined();
            expect(body.meta.schema.name).toBe('event');
        });

        it('should return 404 for non-existent event', async () => {
            const response = await fetch(`${baseURL}/events/00000000-0000-0000-0000-000000000000`, {
                method: 'GET',
                headers: { Authorization: authorization },
            });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /events/:id', () => {
        it('should delete event with 202 status', async () => {
            // Create a fresh event to delete
            const createResponse = await fetch(`${baseURL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authorization,
                },
                body: JSON.stringify(eventPayload),
            });
            const created = await createResponse.json();

            const response = await fetch(`${baseURL}/events/${created.data.id}`, {
                method: 'DELETE',
                headers: { Authorization: authorization },
            });

            expect(response.status).toBe(202);
        });

        it('should return deleted entity', async () => {
            // Create a fresh event to delete
            const createResponse = await fetch(`${baseURL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authorization,
                },
                body: JSON.stringify(eventPayload),
            });
            const created = await createResponse.json();

            const response = await fetch(`${baseURL}/events/${created.data.id}`, {
                method: 'DELETE',
                headers: { Authorization: authorization },
            });

            const body = await response.json();
            expect(body.data.id).toBe(created.data.id);
            expect(body.data.scope).toBe(eventPayload.scope);
            expect(body.meta).toEqual({});
        });

        it('should return 404 for non-existent event', async () => {
            const response = await fetch(`${baseURL}/events/00000000-0000-0000-0000-000000000000`, {
                method: 'DELETE',
                headers: { Authorization: authorization },
            });

            expect(response.status).toBe(404);
        });
    });
});
