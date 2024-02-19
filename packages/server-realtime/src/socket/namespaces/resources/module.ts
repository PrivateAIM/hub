/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { REALM_MASTER_NAME } from '@authup/core';
import { ForbiddenError, UnauthorizedError } from '@ebec/http';
import { useLogger } from '../../../core';
import type { SocketBase, SocketNamespaceContext } from '../../types';
import { registerResourcesNamespaceControllers } from './register';

export function registerResourcesNamespaces({ server, authMiddleware } : SocketNamespaceContext) {
    const workspace = server.of(/^\/resources(?:#[a-z0-9A-Z-_]+)?$/);
    workspace.use(authMiddleware);

    workspace.use((socket: SocketBase, next) => {
        if (!socket.data.userId && !socket.data.robotId) {
            useLogger().error('Socket is not authenticated.');

            next(new UnauthorizedError());
            return;
        }

        const matches = socket.nsp.name.match(/^\/resources(?:#([a-z0-9A-Z-_]+))?$/);
        if (typeof matches[1] === 'undefined') {
            if (socket.data.realmName !== REALM_MASTER_NAME) {
                useLogger().error(`Realm ${socket.data.realmName} is not permitted for the global scope.`);
                next(new ForbiddenError());

                return;
            }
        } else {
            [, socket.data.namespaceId] = matches;

            if (matches[1] !== socket.data.realmId && socket.data.realmName !== REALM_MASTER_NAME) {
                useLogger().error(`Realm ${socket.data.realmName} is not permitted for the realm ${matches[1]}.`);
                next(new ForbiddenError());
                return;
            }
        }

        useLogger().debug(`Socket ${socket.id} connected.`);

        next();
    });

    registerResourcesNamespaceControllers(workspace);
}
