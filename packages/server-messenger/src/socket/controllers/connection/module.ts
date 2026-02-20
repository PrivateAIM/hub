/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Socket } from '../../types.ts';
import {
    mountConnectionConnectHandler,
    mountConnectionSubscriptionHandlers,
    mountSocketConnectionDisconnectingHandler,
} from './handlers/index.ts';

export function mountConnectionController(socket: Socket) {
    mountConnectionConnectHandler(socket);
    mountSocketConnectionDisconnectingHandler(socket);
    mountConnectionSubscriptionHandlers(socket);
}
