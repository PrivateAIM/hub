/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { SocketBase } from '../../types';
import {
    registerSocketConnectionConnectHandler,
    registerSocketConnectionDisconnectingHandler,
    registerSocketConnectionSubscriptionHandlers,
} from './handlers';

export function registerConnectionController(socket: SocketBase) {
    registerSocketConnectionConnectHandler(socket);
    registerSocketConnectionDisconnectingHandler(socket);
    registerSocketConnectionSubscriptionHandlers(socket);
}
