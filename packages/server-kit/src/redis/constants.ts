/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { Client } from 'redis-extension';

export const REDIS_MODULE_NAME = 'redis';

export const RedisClientInjectionKey = new TypedToken<Client>('RedisClient');
export const RedisPublishClientInjectionKey = new TypedToken<Client>('RedisPublishClient');
export const RedisSubscribeClientInjectionKey = new TypedToken<Client>('RedisSubscribeClient');
