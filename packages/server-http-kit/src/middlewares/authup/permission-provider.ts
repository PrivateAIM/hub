/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    IPermissionProvider,
    PermissionGetOptions,
    PermissionPolicyBindingAggregated,
} from '@authup/access';
import { RealmScope } from '@authup/access';

export class FakePermissionProvider implements IPermissionProvider {
    async findOne(criteria: PermissionGetOptions): Promise<PermissionPolicyBindingAggregated | null> {
        return {
            permission: {
                name: criteria.name,
                realm_id: criteria.realmId,
            },
            // A single grant with no policy and the widest realm reach — an
            // unconditional allow. The evaluator short-circuits to granted for
            // any grant that carries no policy restriction.
            grants: [
                { realm_scope: RealmScope.ANY },
            ],
        };
    }
}
