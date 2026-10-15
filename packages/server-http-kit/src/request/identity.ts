/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { UnauthorizedError } from '@privateaim/errors';
import type { IAppEvent } from 'routup';
import type { RequestIdentity } from './types';
import { setRequestEnv, useRequestEnv } from './env';

export function useRequestIdentity(event: IAppEvent) : RequestIdentity | undefined {
    return useRequestEnv(event, 'identity');
}

export function setRequestIdentity(event: IAppEvent, identity: RequestIdentity) : void {
    setRequestEnv(event, 'identity', identity);
}

export function useRequestIdentityOrFail(event: IAppEvent) : RequestIdentity {
    const identity = useRequestIdentity(event);
    if (!identity) {
        throw new UnauthorizedError();
    }

    return identity;
}
