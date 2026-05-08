/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { HandlerInterface } from '@routup/decorators';
import type { IRoutupEvent } from 'routup';
import { useRequestIdentityOrFail } from '../request';

export class ForceLoggedInMiddleware implements HandlerInterface {
    public run(event: IRoutupEvent) {
        useRequestIdentityOrFail(event);
    }
}
