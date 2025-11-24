/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    registerAnalysisFileSocketHandlers,
    registerAnalysisLogSocketHandlers,
    registerAnalysisNodeForRealmSocketHandlers,
    registerAnalysisNodeSocketHandlers,
    registerAnalysisSocketHandlers,
    registerMasterImageGroupSocketHandlers,
    registerMasterImageSocketHandlers,
    registerNodeSocketHandlers,
    registerProjectNodeForRealmSocketHandlers,
    registerProjectNodeSocketHandlers,
    registerProjectSocketHandlers,
    registerRegistryProjectSocketHandlers,
} from './controllers';
import type { Namespace } from './types';

export function registerSocketControllers(nsp: Namespace) {
    nsp.on('connection', (socket) => {
        socket.on('ping', () => {
            socket.emit('pong');
        });

        // analysis
        registerAnalysisSocketHandlers(socket);
        registerAnalysisFileSocketHandlers(socket);
        registerAnalysisLogSocketHandlers(socket);

        if (socket.data.namespaceId) {
            registerAnalysisNodeForRealmSocketHandlers(socket);
        } else {
            registerAnalysisNodeSocketHandlers(socket);
        }

        // master-image
        registerMasterImageSocketHandlers(socket);
        registerMasterImageGroupSocketHandlers(socket);

        // node
        registerNodeSocketHandlers(socket);

        // project
        registerProjectSocketHandlers(socket);
        if (socket.data.namespaceId) {
            registerProjectNodeForRealmSocketHandlers(socket);
        } else {
            registerProjectNodeSocketHandlers(socket);
        }

        // registry
        registerRegistryProjectSocketHandlers(socket);
    });
}
