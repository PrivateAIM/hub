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
        scope: 'model',
        name: 'updated',
        ref_type: 'project',
        ref_id: '4b324d99-1984-4081-a47d-10e809092075',
        data: { diff: { name: { next: 'new', previous: 'old' } } },
        expiring: true,
        request_path: '/projects/4b324d99-1984-4081-a47d-10e809092075',
        request_method: 'POST',
        request_ip_address: '172.40.1.1',
        request_user_agent: 'TestAgent/1.0',
        actor_type: 'user',
        actor_id: '9b921a45-3846-40ed-a392-deb26a4cc757',
        actor_name: 'admin',
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
            expect(body.id).toBeDefined();
            expect(body.created_at).toBeDefined();
            expect(body.updated_at).toBeDefined();

            createdId = body.id;
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
            expect(body.scope).toBe(eventPayload.scope);
            expect(body.name).toBe(eventPayload.name);
            expect(body.ref_type).toBe(eventPayload.ref_type);
            expect(body.ref_id).toBe(eventPayload.ref_id);
            expect(body.data).toEqual(eventPayload.data);
            expect(body.expiring).toBe(eventPayload.expiring);
            expect(body.request_path).toBe(eventPayload.request_path);
            expect(body.request_method).toBe(eventPayload.request_method);
            expect(body.request_ip_address).toBe(eventPayload.request_ip_address);
            expect(body.request_user_agent).toBe(eventPayload.request_user_agent);
            expect(body.actor_type).toBe(eventPayload.actor_type);
            expect(body.actor_id).toBe(eventPayload.actor_id);
            expect(body.actor_name).toBe(eventPayload.actor_name);

            createdId = body.id;
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
            expect(body.id).toBe(createdId);
            expect(body.scope).toBe(eventPayload.scope);
            expect(body.name).toBe(eventPayload.name);
            expect(body.ref_type).toBe(eventPayload.ref_type);
            expect(body.ref_id).toBe(eventPayload.ref_id);
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

            const response = await fetch(`${baseURL}/events/${created.id}`, {
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

            const response = await fetch(`${baseURL}/events/${created.id}`, {
                method: 'DELETE',
                headers: { Authorization: authorization },
            });

            const body = await response.json();
            expect(body.id).toBe(created.id);
            expect(body.scope).toBe(eventPayload.scope);
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
