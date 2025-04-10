/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PermissionGetOptions, PermissionItem, PermissionProvider } from '@authup/access';

export class FakePermissionProvider implements PermissionProvider {
    async get(criteria: PermissionGetOptions): Promise<PermissionItem | undefined> {
        return {
            name: criteria.name,
            realmId: criteria.realmId,
            policy: null,
        };
    }
}
