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
