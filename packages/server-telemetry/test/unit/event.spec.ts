/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll, beforeAll, describe, expect, it,
} from 'vitest';
import type { Event } from '@privateaim/telemetry-kit';
import {
    createTestSuite,
    expectPropertiesEqualToSrc,
} from '../utils';
import type { EventEntity } from '../../src/database';

describe('controllers/event', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    let details : EventEntity;

    it('should create resource', async () => {
        const client = suite.client();
        const input : Partial<Event> = {
            scope: 'model',
            name: 'updated',
            ref_type: 'project',
            ref_id: '4b324d99-1984-4081-a47d-10e809092075',
            data: {
                diff: {
                    name: {
                        next: 'peterhan',
                        previous: 'peterpan',
                    },
                },
            },
            expiring: true,
            request_path: '/projects/4b324d99-1984-4081-a47d-10e809092075',
            request_method: 'POST',
            request_ip_address: '172.40.1.1',
            request_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            actor_type: 'user',
            actor_id: '9b921a45-3846-40ed-a392-deb26a4cc757',
            actor_name: 'admin',
            expires_at: '2025-08-08T10:14:05.475Z',
        };

        const data = await client.event.create(input);
        expect(data.id).toBeDefined();

        expectPropertiesEqualToSrc(
            input,
            data,
            ['created_at', 'updated_at'],
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
        const data = await client.event.getOne(details.id);

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
