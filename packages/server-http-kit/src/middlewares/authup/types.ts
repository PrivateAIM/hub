/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ITokenVerifier } from '@authup/server-adapter-kit';
import type { Client as RedisClient } from 'redis-extension';
import type { Client as AuthupClient } from '@authup/core-http-kit';

export type AuthorizationMiddlewareRegistrationOptions = {
    authupClient?: AuthupClient,
    redisClient?: RedisClient,
    tokenVerifier?: ITokenVerifier,

    dryRun?: boolean,
};
