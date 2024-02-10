import type { SocketMessagesNamespaceCTSMessagesEvents, SocketMessagesNamespaceSTCEvents, SocketSTSEvents } from '@privateaim/core';
import type { Namespace, Socket } from 'socket.io';
import type { SocketData } from '../../types';

export type MessagesNamespace = Namespace<
SocketMessagesNamespaceCTSMessagesEvents,
SocketMessagesNamespaceSTCEvents,
SocketSTSEvents,
SocketData
>;

export type MessagesNamespaceSocket = Socket<
SocketMessagesNamespaceCTSMessagesEvents,
SocketMessagesNamespaceSTCEvents,
SocketSTSEvents,
SocketData
>;
