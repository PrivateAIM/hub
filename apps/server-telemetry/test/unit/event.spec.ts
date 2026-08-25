/*
 * Copyright (c) 2021-2024.
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
import type { Event } from '@privateaim/telemetry-kit';
import {
    createTestSuite,
    expectPropertiesEqualToSrc,
} from '../utils';
import type { EventEntity } from '../../src/adapters/database/entities/event.ts';

describe('controllers/event', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.setup();
    });

    afterAll(async () => {
        await suite.teardown();
    });

    let details : EventEntity;

    it('should create resource', async () => {
        const client = suite.client();
        const input : Partial<Event> = {
            scope: 'model',
            name: 'updated',
            refType: 'project',
            refId: '4b324d99-1984-4081-a47d-10e809092075',
            data: {
                diff: {
                    name: {
                        next: 'peterhan',
                        previous: 'peterpan',
                    },
                },
            },
            expiring: true,
            requestPath: '/projects/4b324d99-1984-4081-a47d-10e809092075',
            requestMethod: 'POST',
            requestIpAddress: '172.40.1.1',
            requestUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            actorType: 'user',
            actorId: '9b921a45-3846-40ed-a392-deb26a4cc757',
            actorName: 'admin',
            // MUST stay in the future. `expiring: true` makes this row a
            // candidate for the retention sweep, and
            // `EventComponentCleanerHandler.initialize()` runs that sweep
            // immediately on every application start — so a sibling spec file
            // booting its own app deletes an already-expired row out from
            // under this one, between `create` and `delete`. That raced only
            // under full-suite parallelism, which is why it passed in
            // isolation. A hard-coded literal reintroduces the bug the day it
            // goes stale.
            expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
        };

        const { data } = await client.event.create(input);
        expect(data.id).toBeDefined();

        expectPropertiesEqualToSrc(
            input,
            data,
            ['createdAt', 'updatedAt'],
        );

        details = data;
    });

    it('should get collection', async () => {
        const client = suite.client();
        const { data } = await client.event.getMany();
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should read resource', async () => {
        const client = suite.client();
        const { data } = await client.event.getOne(details.id);

        expectPropertiesEqualToSrc(
            details,
            data,
        );
    });

    it('should delete resource', async () => {
        const client = suite.client();
        await client.event.delete(details.id);
    });
});
