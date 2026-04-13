/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Request } from 'routup';
import { getRequestHeader, getRequestIP, useRequestPath } from 'routup';
import {
    useRequestIdentity,
    useRequestIdentityRealm,
    useRequestPermissionChecker,
} from '@privateaim/server-http-kit';
import type { ActorContext } from '../../../../core/index.ts';

export function buildActorContext(req: Request): ActorContext {
    const identity = useRequestIdentity(req);
    const realm = useRequestIdentityRealm(req);
    const permissionChecker = useRequestPermissionChecker(req);

    const metadata: Record<string, any> = {
        request_path: useRequestPath(req),
        request_method: req.method || 'GET',
        request_user_agent: flattenString(
            getRequestHeader(req, 'user-agent'),
        ),
        request_ip_address: getRequestIP(req, { trustProxy: true }),
    };

    if (identity) {
        metadata.actor_id = identity.id;
        metadata.actor_type = identity.type;
        metadata.actor_name = identity.attributes?.name;
    }

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
        metadata,
    };
}

function flattenString(input: string | string[]): string {
    if (typeof input === 'string') {
        return input;
    }

    return input.join(', ');
}
