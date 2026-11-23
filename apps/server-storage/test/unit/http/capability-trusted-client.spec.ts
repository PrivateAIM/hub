/*
 * Copyright (c) 2026.
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
import { createAdminAccessToken, createCapabilityToken } from '@privateaim/server-test-kit';
import { createTestSuite } from '../../utils/index.ts';
import { createTestBucket } from '../../utils/domains/index.ts';

/**
 * Authup lets any client holding a token-exchange capability for `storage`
 * mint storage tokens; storage accepts only the configured client's
 * exchanges. Here storage trusts another client than the `system` client
 * the test kit exchanges as.
 */
describe('capability tokens exchanged by an untrusted client', () => {
    const suite = createTestSuite();

    let admin: string;
    let baseURL: string;
    let bucketId: string;

    beforeAll(async () => {
        process.env.CAPABILITY_CLIENT_ID = '00000000-0000-4000-8000-0000000000ff';

        await suite.up();

        admin = await createAdminAccessToken();

        const client = suite.client();

        baseURL = client.getBaseURL().replace(/\/+$/, '');

        const { data: bucket } = await client.bucket.create(createTestBucket());

        bucketId = bucket.id;
    });

    afterAll(async () => {
        delete process.env.CAPABILITY_CLIENT_ID;

        await suite.down();
    });

    it('should refuse a token another client exchanged', async () => {
        const token = await createCapabilityToken({ subjectToken: admin, cap: [`bucket:${bucketId}:read`] });

        const response = await fetch(`${baseURL}/buckets/${bucketId}`, { headers: { Authorization: `Bearer ${token}` } });

        expect(response.status).toBe(401);
    });

    it('should still accept the access token', async () => {
        const response = await fetch(`${baseURL}/buckets/${bucketId}`, { headers: { Authorization: `Bearer ${admin}` } });

        expect(response.status).toBe(200);
    });
});
