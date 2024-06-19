/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum NodeType {
    AGGREGATOR = 'aggregator',
    DEFAULT = 'default',
}

export enum NodeSocketClientEventName {
    CONNECT = 'nodeConnect',
    DISCONNECT = 'nodeDisconnect',
    MESSAGE = 'nodeMessage',
}

export enum NodeSocketServerEventName {
    CONNECTED = 'nodeConnected',
    DISCONNECTED = 'nodeDisconnected',
    MESSAGE = 'nodeMessage',
}
