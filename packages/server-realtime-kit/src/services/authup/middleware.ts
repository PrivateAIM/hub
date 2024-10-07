/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { TokenCreatorOptions } from '@authup/core-http-kit';
import type { TokenVerifierRedisCacheOptions } from '@authup/server-adapter-kit';
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
    } else if (options.client) {
        baseURL = options.client.getBaseURL();
    }

    if (!baseURL) {
        const data = createFakeTokenVerificationData();

        return (socket, next) => {
            applyTokenVerificationData(socket, data, options.fakeAbilities);
            next();
        };
    }

    let tokenCreator : TokenCreatorOptions;
    if (options.vault) {
        tokenCreator = {
            type: 'robotInVault',
            name: 'system',
            vault: options.vault,
            baseURL,
        };
    } else {
        tokenCreator = {
            type: 'user',
            name: 'admin',
            password: 'start123',
            baseURL,
        };
    }

    let tokenCache : TokenVerifierRedisCacheOptions | undefined;
    if (options.redis) {
        tokenCache = {
            type: 'redis',
            client: options.redis,
        };
    }

    return createMiddleware({
        tokenVerifier: {
            baseURL,
            creator: tokenCreator,
            cache: tokenCache,
        },
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
}
