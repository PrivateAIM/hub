/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IPermissionProvider, PermissionBinding, PermissionGetOptions } from '@authup/access';

export class FakePermissionProvider implements IPermissionProvider {
    async findOne(criteria: PermissionGetOptions): Promise<PermissionBinding | null> {
        return {
            permission: {
                name: criteria.name,
                realm_id: criteria.realmId,
            },
        };
    }
}
