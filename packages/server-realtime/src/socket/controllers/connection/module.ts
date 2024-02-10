import type { SocketBase } from '../../types';
import {
    registerSocketConnectionConnectHandler,
    registerSocketConnectionDisconnectingHandler,
    registerSocketConnectionSubscriptionHandlers,
} from './handlers';

export function registerConnectionController(socket: SocketBase) {
    registerSocketConnectionConnectHandler(socket);
    registerSocketConnectionDisconnectingHandler(socket);
    registerSocketConnectionSubscriptionHandlers(socket);
}
