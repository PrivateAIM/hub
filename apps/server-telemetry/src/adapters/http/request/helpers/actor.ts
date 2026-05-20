/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IAppEvent } from 'routup';
import {
    useRequestIdentity,
    useRequestIdentityRealm,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import type { ActorContext } from '@privateaim/server-kit';

export function buildActorContext(event: IAppEvent): ActorContext {
    const identity = useRequestIdentity(event);
    const realm = useRequestIdentityRealm(event);
    const permissionChecker = useRequestPermissionChecker(event);

    return {
        permissionChecker,
        realm,
        identity: identity ?
            {
                id: identity.id,
                type: identity.type,
                attributes: identity.attributes,
            } :
            undefined,
    };
}
