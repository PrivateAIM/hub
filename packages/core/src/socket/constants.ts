/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export enum SocketSTCEventName {
    USER_CONNECTED = 'userConnected',
    USER_DISCONNECTED = 'userDisconnected',

    ROBOT_CONNECTED = 'robotConnected',
    ROBOT_DISCONNECTED = 'robotDisconnected',
}

export enum SocketCTSEventName {
    USER_CONNECTIONS = 'userConnections',
    USER_CONNECTION_SUBSCRIBE = 'userConnectionSubscribe',
    USER_CONNECTION_UNSUBSCRIBE = 'userConnectionUnsubscribe',

    ROBOT_CONNECTIONS = 'robotConnections',
    ROBOT_CONNECTION_SUBSCRIBE = 'robotConnectionSubscribe',
    ROBOT_CONNECTION_UNSUBSCRIBE = 'robotConnectionUnsubscribe',
}
