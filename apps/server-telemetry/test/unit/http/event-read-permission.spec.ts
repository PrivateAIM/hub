/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import { PermissionName } from '@privateaim/kit';
import { createAdminAuthorizationHeader, createRestrictedAccessToken } from '@privateaim/server-test-kit';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { createTestSuite } from '../../utils';

describe('event read permission', () => {
    const suite = createTestSuite();
    let baseURL: string;

    beforeAll(async () => {
        await suite.setup();
        baseURL = suite.client().getBaseURL().replace(/\/+$/, '');
    });

    afterAll(async () => {
        await suite.teardown();
    });

    const getEvents = (token: string, suffix = '') => fetch(`${baseURL}/events${suffix}`, { headers: { authorization: `Bearer ${token}` } });

    const createEvent = async (refId: string, realmId?: string): Promise<string> => {
        const response = await fetch(`${baseURL}/events`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: await createAdminAuthorizationHeader(),
            },
            body: JSON.stringify({
                scope: 'entity',
                name: 'updated',
                refType: 'project',
                refId,
                ...(realmId ? { realmId } : {}),
            }),
        });
        expect(response.status).toBe(201);
        const { data: { id } } = await response.json();
        return id;
    };

    it('answers 400 for a malformed id', async () => {
        const response = await getEvents(await createRestrictedAccessToken([PermissionName.EVENT_READ]), '/not-a-uuid');

        expect(response.status).toBe(400);
    });

    it('answers 403 for an identity holding no read permission', async () => {
        const response = await getEvents(await createRestrictedAccessToken());

        expect(response.status).toBe(403);
    });

    it('answers 200 for an identity holding EVENT_READ, with its own realm\'s events only', async () => {
        // Both events share one refId, so the read is not at the mercy of pagination.
        const refId = randomUUID();
        // Realm omitted: stamped with the admin's master realm, the restricted user's realm.
        const ownId = await createEvent(refId);
        const foreignId = await createEvent(refId, randomUUID());

        const token = await createRestrictedAccessToken([PermissionName.EVENT_READ]);
        const response = await getEvents(token, `?filter[refId]=${refId}`);

        expect(response.status).toBe(200);
        const { data } = await response.json();
        const ids = data.map((event: { id: string }) => event.id);
        expect(ids).toContain(ownId);
        expect(ids).not.toContain(foreignId);
    });
});
