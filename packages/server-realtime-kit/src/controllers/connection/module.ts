/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Socket } from '../../types';
import {
    mountConnectionConnectHandler,
    mountConnectionSubscriptionHandlers,
    mountSocketConnectionDisconnectingHandler,
} from './handlers';

export function mountConnectionController(socket: Socket) {
    mountConnectionConnectHandler(socket);
    mountSocketConnectionDisconnectingHandler(socket);
    mountConnectionSubscriptionHandlers(socket);
}
