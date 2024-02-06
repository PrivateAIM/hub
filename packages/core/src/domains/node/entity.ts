/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Realm, Robot } from '@authup/core';
import type { SocketClientToServerEventCallback, SocketClientToServerEventErrorCallback, SocketServerToClientEventContext } from '../../socket';
import type { DomainType } from '../constants';
import type { RegistryProject } from '../registry-project';
import type { Registry } from '../registry';
import type { DomainEventBaseContext } from '../types-base';
import type { NodeSocketClientEventName, NodeSocketServerEventName, NodeType } from './constants';

export interface Node {
    id: string;

    external_name: string | null;

    name: string;

    email: string | null;

    hidden: boolean;

    type: `${NodeType}`;

    online: boolean;

    // ------------------------------------------------------------------

    registry_id: Registry['id'];

    registry: Registry;

    registry_project_id: RegistryProject['id'] | null;

    registry_project: RegistryProject;

    // ------------------------------------------------------------------

    robot_id: Robot['id'] | null;

    // ------------------------------------------------------------------

    realm_id: Realm['id'];

    // ------------------------------------------------------------------

    created_at: Date;

    updated_at: Date;
}

export type NodeEventContext = DomainEventBaseContext & {
    type: `${DomainType.NODE}`,
    data: Node
};

export type NodeSocketClientMessage = {
    to: Node['id'][],
    data: Record<string, any>,
    metadata: Record<string, any>
};

export type NodeSocketClientToServerEvents = {
    [NodeSocketClientEventName.CONNECT]: (
        cb?: SocketClientToServerEventCallback | SocketClientToServerEventErrorCallback
    ) => void,
    [NodeSocketClientEventName.DISCONNECT]: (
        cb?: SocketClientToServerEventCallback | SocketClientToServerEventErrorCallback
    ) => void,
    [NodeSocketClientEventName.MESSAGE]: (
        data: NodeSocketClientMessage
    ) => void
};

export type NodeSocketEventConnectedContext = {
    data: {
        id: Node['id']
    }
};

export type NodeSocketEventDisconnectedContext = NodeSocketEventConnectedContext;

export type NodeSocketServerMessage = {
    from: Node['id'],
    data: Record<string, any>,
    metadata: Record<string, any>
};

export type NodeSocketServerToClientEvents = {
    [NodeSocketServerEventName.CONNECTED]: (
        data: SocketServerToClientEventContext<NodeSocketEventConnectedContext>
    ) => void,
    [NodeSocketServerEventName.DISCONNECTED]: (
        data: SocketServerToClientEventContext<NodeSocketEventDisconnectedContext>
    ) => void,
    [NodeSocketServerEventName.MESSAGE]: (
        data: NodeSocketServerMessage,
        cb?: SocketClientToServerEventCallback | SocketClientToServerEventErrorCallback
    ) => void
};
