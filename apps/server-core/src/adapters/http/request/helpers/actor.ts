/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { IAppEvent } from 'routup';
import { getRequestHeader, getRequestIP } from 'routup';
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

    const metadata: Record<string, any> = {
        request_path: event.path,
        request_method: event.method || 'GET',
        request_user_agent: flattenString(
            getRequestHeader(event, 'user-agent'),
        ),
        request_ip_address: getRequestIP(event, { trustProxy: true }),
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

function flattenString(input: string | string[] | undefined): string {
    if (typeof input === 'string') {
        return input;
    }

    if (!input) {
        return '';
    }

    return input.join(', ');
}
