/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EntityType } from '@authup/core-kit';
import {
    type Component, EnvironmentName, isRedisClientUsable, useLogger,
    useRedisSubscribeClient,
} from '@privateaim/server-kit';
import { useEnv } from '../../config/index.ts';
import {
    handleAuthupPermissionEvent,
    handleAuthupPolicyEvent,
    handleAuthupRealmEvent,
    handleAuthupRobotEvent,
    handleAuthupUserEvent,
} from './entities/index.ts';

export function createAuthupAggregator() : Component {
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

            redisSub.subscribe(
                'permission',
                'policy',
                'realm',
                'user',
                'robot',
            );

            redisSub.on('message', async (channel, message) => {
                useLogger().debug(`Received event from channel ${channel}`);
                const event = JSON.parse(message);

                switch (event.type) {
                    case EntityType.POLICY: {
                        await handleAuthupPolicyEvent(event);
                        break;
                    }
                    case EntityType.PERMISSION: {
                        await handleAuthupPermissionEvent(event);
                        break;
                    }
                    case EntityType.REALM: {
                        await handleAuthupRealmEvent(event);
                        break;
                    }
                    case EntityType.ROBOT: {
                        await handleAuthupRobotEvent(event);
                        break;
                    }
                    case EntityType.USER: {
                        await handleAuthupUserEvent(event);
                        break;
                    }
                }
            });
        },
    };
}
