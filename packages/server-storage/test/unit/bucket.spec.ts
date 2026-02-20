/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    afterAll, beforeAll, describe, expect, it,
} from 'vitest';
import {
    createTestSuite,
    expectPropertiesEqualToSrc,
    removeDateProperties,
} from '../utils';
import type { BucketEntity } from '../../src/database';
import { createTestBucket } from '../utils/domains/index.ts';

describe('controllers/bucket', () => {
    const suite = createTestSuite();

    beforeAll(async () => {
        await suite.up();
    });

    afterAll(async () => {
        await suite.down();
    });

    let details : BucketEntity;

    it('should create resource', async () => {
        const client = suite.client();
        const input = createTestBucket({
            region: 'eu-west',
        });
        const data = await client.bucket.create(input);

        expect(data.name).toEqual(input.name);
        expect(data.region).toEqual('eu-west');

        details = removeDateProperties(data);
    });

    it('should get collection', async () => {
        const client = suite.client();
        const { data } = await client.bucket.getMany();
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    it('should read resource', async () => {
        const client = suite.client();
        const data = await client.bucket.getOne(details.id);

        expectPropertiesEqualToSrc(details, data);
    });

    it('should delete resource', async () => {
        const client = suite.client();
        await client.bucket.delete(details.id);
    });
});
