/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { UnauthorizedError } from '@ebec/http';
import type { Namespace, Server } from '../types';

export function mountForceLoggedInMiddleware(input: Namespace | Server) {
    input.use((socket, next) => {
        if (socket.data.userId || socket.data.robotId) {
            next();
            return;
        }

        next(new UnauthorizedError());
    });
}
