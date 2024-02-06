/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    registerAnalysisFileSocketHandlers,
    registerAnalysisLogSocketHandlers,
    registerAnalysisNodeSocketHandlers,
    registerAnalysisSocketHandlers,
    registerNodeSocketHandlers,
    registerProjectNodeForRealmSocketHandlers,
    registerProjectNodeSocketHandlers,
    registerProjectSocketHandlers,
    registerRegistryProjectSocketHandlers,
    registerAnalysisNodeForRealmSocketHandlers,
} from './controllers';
import type { SocketHandlerContext, SocketNamespaceInterface, SocketServerInterface } from './type';

export function registerSocketHandlers(server: SocketServerInterface) {
    server.on('connection', (socket) => {
        // this will be the root namespace with all realm resources

        const context : SocketHandlerContext = {
            server,
            socket,
        };

        registerProjectSocketHandlers(context);
        registerProjectNodeSocketHandlers(context);

        registerRegistryProjectSocketHandlers(context);

        registerNodeSocketHandlers(context);

        registerAnalysisSocketHandlers(context);
        registerAnalysisFileSocketHandlers(context);
        registerAnalysisLogSocketHandlers(context);
        registerAnalysisNodeSocketHandlers(context);
    });
}

export function registerSocketNamespaceHandlers(
    namespace: SocketNamespaceInterface,
    server: SocketServerInterface,
) {
    namespace.on('connection', (socket) => {
        const context : SocketHandlerContext = {
            server,
            socket,
            namespace,
        };

        registerProjectSocketHandlers(context);
        registerProjectNodeForRealmSocketHandlers(context);

        registerRegistryProjectSocketHandlers(context);

        registerNodeSocketHandlers(context);

        registerAnalysisSocketHandlers(context);
        registerAnalysisFileSocketHandlers(context);
        registerAnalysisLogSocketHandlers(context);
        registerAnalysisNodeForRealmSocketHandlers(context);
    });
}
