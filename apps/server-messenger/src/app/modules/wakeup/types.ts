/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Logger } from '@privateaim/server-kit';
import type { Client as RedisClient } from 'redis-extension';
import type { MessageParty } from '@privateaim/messenger-kit';

export type RedisMessageWakeupContext = {
    onPending?: (recipient: MessageParty) => void,
    publishClient: RedisClient,
    subscribeClient: RedisClient,
    logger?: Logger
};
