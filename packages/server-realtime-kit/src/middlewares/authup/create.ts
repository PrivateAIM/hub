/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { UnauthorizedError } from '@ebec/http';
import { createUserTokenCreator } from '@authup/core-http-kit';
import {
    isRedisClientUsable, useLogger, useRedisClient,
} from '@privateaim/server-kit';
import { LogChannel, LogFlag } from '@privateaim/telemetry-kit';
import type { Client as RedisClient } from 'redis-extension';
import type { ITokenVerifierCache } from '@authup/server-adapter-kit';
import { MemoryTokenVerifierCache, RedisTokenVerifierCache, TokenVerifier } from '@authup/server-adapter-kit';
import { createMiddleware } from '@authup/server-adapter-socket-io';
import type {
    Middleware, Namespace, Server, Socket,
} from '../../types';
import type { AuthupMiddlewareRegistrationOptions } from './types';
import { applyTokenVerificationData, createFakeTokenVerificationData } from './utils';

export function createAuthupMiddleware(
    options: AuthupMiddlewareRegistrationOptions,
) : Middleware {
    let baseURL : string | undefined;
    if (options.baseURL) {
        baseURL = options.baseURL;
    }

    let redis : RedisClient | undefined;
    if (isRedisClientUsable()) {
        redis = useRedisClient();
    }

    if (!baseURL) {
        const data = createFakeTokenVerificationData();

        return (socket, next) => {
            applyTokenVerificationData(socket, data, options.fakeAbilities);
            next();
        };
    }

    // todo: refactor this
    const tokenCreator = createUserTokenCreator({
        name: 'admin',
        password: 'start123',
    }, {
        client: {
            baseURL,
        },
    });

    let cache : ITokenVerifierCache;
    if (redis) {
        cache = new RedisTokenVerifierCache(redis);
    } else {
        cache = new MemoryTokenVerifierCache();
    }

    return createMiddleware({
        tokenVerifier: new TokenVerifier({
            baseURL,
            creator: tokenCreator,
            cache,
        }),
        tokenVerifierHandler: (
            socket: Socket,
            data,
        ) => applyTokenVerificationData(socket, data, options.fakeAbilities),
    });
}

export function mountAuthupMiddleware(
    nsp: Namespace | Server,
    options: AuthupMiddlewareRegistrationOptions,
) {
    const middleware = createAuthupMiddleware(options);
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
