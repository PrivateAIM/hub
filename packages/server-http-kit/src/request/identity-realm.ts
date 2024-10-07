/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Request } from 'routup';
import { useRequestIdentity } from './identity';

type RequestRealm = {
    id: string,
    name: string
};

export function useRequestIdentityRealm(req: Request) : RequestRealm {
    const identity = useRequestIdentity(req);
    if (!identity) {
        return undefined;
    }

    return {
        id: identity.realmId,
        name: identity.realmName,
    };
}
