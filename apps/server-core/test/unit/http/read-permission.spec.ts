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
 * The global catalogs are readable only with a read grant (or one of the
 * entity's write/manage grants); a logged-in caller without one gets 403.
 */
describe('read permission on global catalogs', () => {
    const suite = createTestApplication();
    let baseURL: string;

    beforeAll(async () => {
        await suite.setup();
        baseURL = suite.client.getBaseURL().replace(/\/+$/, '');
    });

    afterAll(async () => {
        await suite.teardown();
    });

    const status = async (path: string, token: string) => {
        const response = await fetch(`${baseURL}${path}`, { headers: { authorization: `Bearer ${token}` } });
        return response.status;
    };

    it.each([
        ['/nodes', PermissionName.NODE_READ],
        ['/master-images', PermissionName.MASTER_IMAGE_READ],
        ['/master-image-groups', PermissionName.MASTER_IMAGE_GROUP_READ],
        ['/registries', PermissionName.REGISTRY_READ],
    ])('GET %s requires %s', async (path, permissionName) => {
        expect(await status(path, await createRestrictedAccessToken([]))).toBe(403);
        expect(await status(path, await createRestrictedAccessToken([permissionName]))).toBe(200);
    });
});
