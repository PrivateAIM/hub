/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { VaultClient } from '@hapic/vault';
import type { Client as RedisClient } from 'redis-extension';
import type { Client as AuthupClient } from '@authup/core-http-kit';

export type AuthupMiddlewareRegistrationOptions = {
    client?: AuthupClient,
    vaultClient?: VaultClient,
    redisClient?: RedisClient,
    fakeAbilities?: boolean
};
