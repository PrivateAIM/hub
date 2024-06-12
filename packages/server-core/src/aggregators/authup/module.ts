/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainType } from '@authup/core-kit';
import { isRedisClientUsable, useLogger, useRedisSubscribeClient } from '@privateaim/server-kit';
import type { Aggregator } from '@privateaim/server-kit';
import { EnvironmentName, useEnv } from '../../config';
import {
    handleAuthupRealmEvent,
    handleAuthupUserEvent,
} from './entities';

export function createAuthupAggregator() : Aggregator {
    if (!isRedisClientUsable() || useEnv('env') === EnvironmentName.TEST) {
        return {
            start() {
                useLogger().warn('Authup aggregator has not been initialized');
            },
        };
    }
    return {
        start() {
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
                        // await handleAuthupRobotEvent(event);
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
