/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { UnauthorizedError } from '@privateaim/errors';
import type { HandlerInterface } from '@routup/decorators';
import type { IAppEvent } from 'routup';
import { useRequestCapability, useRequestIdentity } from '../request';

/**
 * Passes an identity or a capability token from any source, the query
 * included. Only for stream (download) routes, where a browser cannot set a
 * header. The route itself must still check that the capability covers the
 * resource.
 */
export class ForceIdentityOrStreamCapabilityMiddleware implements HandlerInterface {
    public run(event: IAppEvent) {
        if (!useRequestIdentity(event) && !useRequestCapability(event)) {
            throw new UnauthorizedError();
        }

        return event.next();
    }
}
