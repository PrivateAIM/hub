/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { write } from 'envix';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { createAdminAccessToken } from '@privateaim/server-test-kit';
import { createTestSuite } from '../../utils/index.ts';
import { createTestBucket } from '../../utils/domains/index.ts';

/**
 * A top-level browser navigation (a bucket/file download, `GET .../stream`)
 * can't carry an `Authorization` header, so the authup middleware falls back
 * to an `access_token` cookie. `COOKIE_PREFIX` namespaces that cookie the
 * same way `@authup/client-web-nuxt`'s `cookiePrefix` namespaces the one
 * client-ui writes (#1890) — this pins that the two stay in agreement.
 */
describe('authup middleware cookie-fallback with COOKIE_PREFIX', () => {
    const suite = createTestSuite();
    let accessToken: string;
    let bucketId: string;

    beforeAll(async () => {
        write('COOKIE_PREFIX', 'flame_');
        await suite.up();

        accessToken = await createAdminAccessToken();

        const { data: bucket } = await suite.client().bucket.create(createTestBucket());
        bucketId = bucket.id;
    });

    afterAll(async () => {
        await suite.down();
        write('COOKIE_PREFIX', undefined);
    });

    it('authenticates a request carrying the prefixed cookie', async () => {
        const baseURL = suite.client().getBaseURL().replace(/\/+$/, '');

        const response = await fetch(`${baseURL}/buckets/${bucketId}`, { headers: { Cookie: `flame_access_token=${accessToken}` } });

        expect(response.status).toBe(200);
    });

    it('rejects the bare (unprefixed) cookie name once a prefix is configured', async () => {
        const baseURL = suite.client().getBaseURL().replace(/\/+$/, '');

        const response = await fetch(`${baseURL}/buckets/${bucketId}`, { headers: { Cookie: `access_token=${accessToken}` } });

        expect(response.status).toBe(401);
    });
});
