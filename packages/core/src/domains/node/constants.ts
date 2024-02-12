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
