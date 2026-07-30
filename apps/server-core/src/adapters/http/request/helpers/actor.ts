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
import type { ActorContext, EntityEventMetadata } from '@privateaim/server-kit';

export function buildActorContext(event: IAppEvent): ActorContext {
    const identity = useRequestIdentity(event);
    const realm = useRequestIdentityRealm(event);
    const permissionChecker = useRequestPermissionChecker(event);

    // Typed against EntityEventMetadata rather than Record<string, any>: these
    // keys are read back BY NAME in @privateaim/server-telemetry-kit's
    // EntityEventHandler and land on the telemetry `events` row, so a one-sided
    // rename would silently drop every audit field.
    const metadata: Partial<EntityEventMetadata> = {
        requestPath: event.path,
        requestMethod: event.method || 'GET',
        requestUserAgent: flattenString(
            getRequestHeader(event, 'user-agent'),
        ),
        requestIpAddress: getRequestIP(event, { trustProxy: true }),
    };

    if (identity) {
        metadata.actorId = identity.id;
        metadata.actorType = identity.type;
        metadata.actorName = identity.attributes?.name;
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
