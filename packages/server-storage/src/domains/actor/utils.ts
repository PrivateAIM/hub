/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Request } from 'routup';
import { useRequestEnv } from '@privateaim/server-http-kit';
import { ActorType } from './constants';
import type { Actor } from './type';

export function getActorFromRequest(req: Request) : Actor | undefined {
    const userId = useRequestEnv(req, 'userId');
    if (userId) {
        return { type: ActorType.USER, id: userId };
    }

    const robotId = useRequestEnv(req, 'robotId');
    if (robotId) {
        return { type: ActorType.ROBOT, id: robotId };
    }

    return undefined;
}
