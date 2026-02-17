/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IPermissionRepository, PermissionGetOptions, PermissionItem } from '@authup/access';

export class FakePermissionProvider implements IPermissionRepository {
    async findOne(criteria: PermissionGetOptions): Promise<PermissionItem | null> {
        return {
            name: criteria.name,
            realmId: criteria.realmId,
            policy: null,
        };
    }
}
