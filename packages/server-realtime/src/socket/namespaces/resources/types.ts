import type { SocketResourcesNamespaceCTSEvents, SocketResourcesNamespaceSTCEvents, SocketSTSEvents } from '@privateaim/core';
import type { Namespace, Socket } from 'socket.io';
import type { SocketData } from '../../types';

export type ResourcesNamespace = Namespace<
SocketResourcesNamespaceCTSEvents,
SocketResourcesNamespaceSTCEvents,
SocketSTSEvents,
SocketData
>;

export type ResourcesNamespaceSocket = Socket<
SocketResourcesNamespaceCTSEvents,
SocketResourcesNamespaceSTCEvents,
SocketSTSEvents,
SocketData
>;
