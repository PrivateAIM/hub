/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@authup/core-kit';
import { isRedisClientUsable, useLogger, useRedisSubscribeClient } from '@privateaim/server-kit';
import type { Aggregator } from '../type';
import {
    handleAuthupRealmEvent,
    handleAuthupRobotEvent,
    handleAuthupUserEvent,
} from './entities';

export function buildAuthupAggregator() : Aggregator {
    return {
        start() {
            if (!isRedisClientUsable()) {
                useLogger().info('Authup aggregator is missing redis configuration.');
                return;
            }

            const redisSub = useRedisSubscribeClient();

            redisSub.subscribe('realm', 'user', 'robot');

            redisSub.on('message', async (channel, message) => {
                useLogger().info(`Received event from channel ${channel}`);
                const event = JSON.parse(message);

                switch (event.type) {
                    case DomainType.REALM: {
                        await handleAuthupRealmEvent(event);
                        break;
                    }
                    case DomainType.ROBOT: {
                        await handleAuthupRobotEvent(event);
                        break;
                    }
                    case DomainType.USER: {
                        await handleAuthupUserEvent(event);
                        break;
                    }
                }
            });
        },
    };
}
