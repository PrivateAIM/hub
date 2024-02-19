/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { UnauthorizedError } from '@ebec/http';
import { useLogger } from '../../../core';
import type { SocketNamespaceContext } from '../../types';
import { registerMessagesNamespaceControllers } from './register';
import type { MessagesNamespace } from './types';

export function registerMessagesNamespace({ authMiddleware, server } : SocketNamespaceContext) {
    const nsp : MessagesNamespace = server.of('/messages');
    nsp.use(authMiddleware);
    nsp.use((socket, next) => {
        if (!socket.data.userId && !socket.data.robotId) {
            useLogger().error('Socket is not authenticated.');

            next(new UnauthorizedError());
        }
    });

    registerMessagesNamespaceControllers(nsp);
}
