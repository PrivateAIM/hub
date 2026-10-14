/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName } from '@privateaim/kit';
import { createAdminAccessToken, createRestrictedAccessToken } from '@privateaim/server-test-kit';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { createTestSuite } from '../../utils/index.ts';
import { createTestBucket } from '../../utils/domains/index.ts';

/**
 * An authup evaluator denial must answer 403. It used to answer 400 (an
 * `evaluationFailed` carrying issues matched validup's shape fallback in
 * `sanitizeError`) or 500 (no issues), so no denial anywhere produced 403.
 */
describe('authorization denial status', () => {
    const suite = createTestSuite();
    let baseURL: string;

    beforeAll(async () => {
        await suite.up();
        baseURL = suite.client().getBaseURL().replace(/\/+$/, '');
    });

    afterAll(async () => {
        await suite.down();
    });

    const createBucket = (token: string) => fetch(`${baseURL}/buckets`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createTestBucket()),
    });

    // Credential confusion: a malformed bearer used to be introspected as the
    // storage service's own client (authup falls back to the request's
    // inherited `Authorization` header) and could create a bucket as it.
    it('answers 401 for a malformed bearer instead of acting as the service client', async () => {
        const response = await createBucket('not-a-token');

        expect(response.status).toBe(401);
    });

    it('answers 403 for an identity holding no permission', async () => {
        const response = await createBucket(await createRestrictedAccessToken());

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.code).toMatch(/^permission_/);
    });

    it('answers 403 for an identity holding a different permission', async () => {
        const response = await createBucket(await createRestrictedAccessToken([PermissionName.BUCKET_DELETE]));

        expect(response.status).toBe(403);
    });

    // Negative control: the restricted path is not simply broken — the same
    // user shape holding the checked permission is let through.
    it('answers 201 for an identity holding the checked permission', async () => {
        const response = await createBucket(await createRestrictedAccessToken([PermissionName.BUCKET_CREATE]));

        expect(response.status).toBe(201);
    });

    it('answers 201 for the admin', async () => {
        const response = await createBucket(await createAdminAccessToken());

        expect(response.status).toBe(201);
    });
});
