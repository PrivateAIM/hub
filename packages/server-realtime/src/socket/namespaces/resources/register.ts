import { registerConnectionController } from '../../controllers';
import {
    registerAnalysisFileSocketHandlers,
    registerAnalysisLogSocketHandlers,
    registerAnalysisNodeForRealmSocketHandlers,
    registerAnalysisNodeSocketHandlers,
    registerAnalysisSocketHandlers,
    registerNodeSocketHandlers,
    registerProjectNodeForRealmSocketHandlers,
    registerProjectNodeSocketHandlers,
    registerProjectSocketHandlers,
    registerRegistryProjectSocketHandlers,
} from './controllers';
import type { ResourcesNamespace } from './types';

export function registerResourcesNamespaceControllers(nsp: ResourcesNamespace) {
    nsp.on('connection', (socket) => {
        registerConnectionController(socket);

        // project-node
        registerProjectSocketHandlers(socket);
        if (socket.data.namespaceId) {
            registerProjectNodeForRealmSocketHandlers(socket);
        } else {
            registerProjectNodeSocketHandlers(socket);
        }

        // registry-project
        registerRegistryProjectSocketHandlers(socket);

        // node
        registerNodeSocketHandlers(socket);

        // analysis
        registerAnalysisSocketHandlers(socket);
        registerAnalysisFileSocketHandlers(socket);
        registerAnalysisLogSocketHandlers(socket);

        if (socket.data.namespaceId) {
            registerAnalysisNodeForRealmSocketHandlers(socket);
        } else {
            registerAnalysisNodeSocketHandlers(socket);
        }
    });
}
