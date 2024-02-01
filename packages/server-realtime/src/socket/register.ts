/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { registerAnalysisLogSocketHandlers } from './controllers';
import { registerAnalysisSocketHandlers } from './controllers';
import type { SocketNamespaceInterface, SocketServerInterface } from './type';
import { registerProjectSocketHandlers } from './controllers';
import {
    registerProposalStationForRealmSocketHandlers,
    registerProjectNodeSocketHandlers,
} from './controllers';
import {
    registerTrainStationForRealmSocketHandlers,
    registerAnalysisNodeSocketHandlers,
} from './controllers';
import { registerAnalysisFileSocketHandlers } from './controllers';
import { registerNodeSocketHandlers } from './controllers';
import { registerRegistryProjectSocketHandlers } from './controllers';

export function registerSocketHandlers(io: SocketServerInterface) {
    io.on('connection', (socket) => {
        // this will be the root namespace with all realm resources

        registerProjectSocketHandlers(io, socket);
        registerProjectNodeSocketHandlers(io, socket);

        registerRegistryProjectSocketHandlers(io, socket);

        registerNodeSocketHandlers(io, socket);

        registerAnalysisSocketHandlers(io, socket);
        registerAnalysisFileSocketHandlers(io, socket);
        registerAnalysisLogSocketHandlers(io, socket);
        registerAnalysisNodeSocketHandlers(io, socket);
    });
}

export function registerSocketNamespaceHandlers(io: SocketNamespaceInterface) {
    io.on('connection', (socket) => {
        registerProjectSocketHandlers(io, socket);
        registerProposalStationForRealmSocketHandlers(io, socket);

        registerRegistryProjectSocketHandlers(io, socket);

        registerNodeSocketHandlers(io, socket);

        registerAnalysisSocketHandlers(io, socket);
        registerAnalysisFileSocketHandlers(io, socket);
        registerAnalysisLogSocketHandlers(io, socket);
        registerTrainStationForRealmSocketHandlers(io, socket);
    });
}
