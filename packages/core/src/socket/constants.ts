export enum SocketSTCEventName {
    USER_CONNECTED = 'userConnected',
    USER_DISCONNECTED = 'userDisconnected',

    ROBOT_CONNECTED = 'robotConnected',
    ROBOT_DISCONNECTED = 'robotDisconnected',
}

export enum SocketCTSEventName {
    USER_CONNECTION_SUBSCRIBE = 'userStatusSubscribe',
    USER_CONNECTION_UNSUBSCRIBE = 'userStatusUnsubscribe',

    ROBOT_CONNECTION_SUBSCRIBE = 'robotStatusSubscribe',
    ROBOT_CONNECTION_UNSUBSCRIBE = 'robotStatusUnsubscribe',
}
