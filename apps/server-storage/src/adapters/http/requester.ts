/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { buildActorContext, useRequestCapability } from '@privateaim/server-http-kit';
import type { IAppEvent } from 'routup';
import type { StorageCapability, StorageRequester } from '../../core/capability/types.ts';

/**
 * The capability a request was verified with, narrowed to what storage judges.
 * Only call it behind a route guard that admits capabilities
 * (`ForceIdentityOrCapabilityMiddleware`, or the stream variant on the two
 * stream routes).
 */
export function useStorageCapability(event: IAppEvent): StorageCapability | undefined {
    const capability = useRequestCapability(event);

    if (!capability) {
        return undefined;
    }

    return {
        subject: {
            id: capability.subject.id,
            type: capability.subject.type,
            realmId: capability.subject.realmId,
        },
        entries: capability.entries,
    };
}

export function useStorageRequester(event: IAppEvent): StorageRequester {
    const capability = useStorageCapability(event);

    if (capability) {
        return { type: 'capability', capability };
    }

    return { type: 'actor', actor: buildActorContext(event) };
}
