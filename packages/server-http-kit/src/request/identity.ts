/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { REALM_MASTER_NAME } from '@authup/core-kit';
import { UnauthorizedError } from '@ebec/http';
import type { IRoutupEvent } from 'routup';
import type { RequestIdentity } from './types';
import { setRequestEnv, useRequestEnv } from './env';

export function useRequestIdentity(event: IRoutupEvent) : RequestIdentity | undefined {
    return useRequestEnv(event, 'identity');
}

export function setRequestIdentity(event: IRoutupEvent, identity: RequestIdentity) : void {
    setRequestEnv(event, 'identity', identity);
}

export function useRequestIdentityOrFail(event: IRoutupEvent) : RequestIdentity {
    const identity = useRequestIdentity(event);
    if (!identity) {
        throw new UnauthorizedError();
    }

    return identity;
}

export function isRequestIdentityMasterRealmMember(input: RequestIdentity) : boolean {
    return input.realmName === REALM_MASTER_NAME;
}
