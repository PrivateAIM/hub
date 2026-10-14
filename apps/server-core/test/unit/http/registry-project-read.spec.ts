/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { PermissionName } from '@privateaim/kit';
import { createRestrictedAccessToken } from '@privateaim/server-test-kit';
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
} from 'vitest';
import { createTestApplication } from '../../app';

/**
 * Reading registry projects requires a read grant: a logged-in caller
 * holding none is refused instead of listing every Harbor project.
 */
describe('registry-project read authorization', () => {
    const suite = createTestApplication();
    let baseURL: string;

    beforeAll(async () => {
        await suite.setup();
        baseURL = suite.client.getBaseURL().replace(/\/+$/, '');
    });

    afterAll(async () => {
        await suite.teardown();
    });

    const list = (token: string) => fetch(`${baseURL}/registry-projects`, { headers: { authorization: `Bearer ${token}` } });

    it('answers 403 for an identity holding no permission', async () => {
        const response = await list(await createRestrictedAccessToken());

        expect(response.status).toBe(403);
    });

    it('answers 200 for an identity holding the read permission', async () => {
        const response = await list(await createRestrictedAccessToken([PermissionName.REGISTRY_PROJECT_READ]));

        expect(response.status).toBe(200);
    });
});
