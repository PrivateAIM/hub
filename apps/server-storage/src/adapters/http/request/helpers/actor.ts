/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Request } from 'routup';
import {
    useRequestIdentity,
    useRequestIdentityRealm,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import type { ActorContext } from '@privateaim/server-kit';

export function buildActorContext(req: Request): ActorContext {
    const identity = useRequestIdentity(req);
    const realm = useRequestIdentityRealm(req);
    const permissionChecker = useRequestPermissionChecker(req);

    return {
        permissionChecker,
        realm,
        identity: identity ?
            {
                id: identity.id,
                type: identity.type,
                realmId: identity.realmId,
                attributes: identity.attributes,
            } :
            undefined,
    };
}
