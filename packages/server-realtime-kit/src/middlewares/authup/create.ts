/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { UnauthorizedError } from '@ebec/http';
import {
    useLogger,
} from '@privateaim/server-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import { createMiddleware } from '@authup/server-adapter-socket-io';
import type {
    Middleware, Namespace, Server, Socket,
} from '../../types';
import type { AuthorizationMiddlewareRegistrationOptions } from './types';
import { applyTokenVerificationData, createFakeTokenVerificationData } from './utils';

export function createAuthorizationMiddleware(
    options: AuthorizationMiddlewareRegistrationOptions,
) : Middleware {
    if (!options.baseURL) {
        const data = createFakeTokenVerificationData();

        return (socket, next) => {
            applyTokenVerificationData(socket, data, options.fakeAbilities);
            next();
        };
    }

    return createMiddleware({
        tokenVerifier: options.tokenVerifier,
        tokenVerifierHandler: (
            socket: Socket,
            data,
        ) => applyTokenVerificationData(socket, data, options.fakeAbilities),
    });
}

export function mountAuthorizationMiddleware(
    nsp: Namespace | Server,
    options: AuthorizationMiddlewareRegistrationOptions,
) {
    const middleware = createAuthorizationMiddleware(options);
    nsp.use(middleware);

    nsp.use((socket, next) => {
        if (socket.data.userId) {
            useLogger().info(`Socket/${socket.id}: User connected.`, {
                [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                actor_type: 'user',
                actor_id: socket.data.userId,
            });
        } else if (socket.data.robotId) {
            useLogger().info(`Socket/${socket.id}: Robot connected.`, {
                [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                actor_type: 'robot',
                actor_id: socket.data.robotId,
            });
        } else if (socket.data.clientId) {
            useLogger().info(`Socket/${socket.id}: Client connected.`, {
                [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                actor_type: 'client',
                actor_id: socket.data.clientId,
            });
        } else {
            useLogger().warn(`Socket/${socket.id}: Not authenticated.`, {
                [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
            });

            next(new UnauthorizedError());
            return;
        }

        socket.on('disconnect', () => {
            if (socket.data.userId) {
                useLogger().info(`Socket/${socket.id}: User disconnected`, {
                    [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                    actor_type: 'user',
                    actor_id: socket.data.userId,
                });
            } else if (socket.data.robotId) {
                useLogger().info(`Socket/${socket.id}: Robot disconnected`, {
                    [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                    actor_type: 'robot',
                    actor_id: socket.data.userId,
                });
            } else if (socket.data.clientId) {
                useLogger().info(`Socket/${socket.id}: Client disconnected`, {
                    [LogFlag.CHANNEL]: LogChannel.WEBSOCKET,
                    actor_type: 'client',
                    actor_id: socket.data.clientId,
                });
            }
        });

        next();
    });
}
