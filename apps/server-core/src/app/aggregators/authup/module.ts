/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EntityType } from '@authup/core-kit';
import type { Component, Logger } from '@privateaim/server-kit';
import { EnvironmentName } from '@privateaim/server-kit';
import type { Client as RedisClient } from 'redis-extension';
import type { RegistryComponentCaller } from '../../components/registry/caller/module.ts';
import {
    handleAuthupPermissionEvent,
    handleAuthupPolicyEvent,
    handleAuthupRealmEvent,
    handleAuthupRobotEvent,
    handleAuthupUserEvent,
} from './entities/index.ts';

type AuthupAggregatorContext = {
    env: string;
    registryComponentCaller?: RegistryComponentCaller;
    redisSubscribeClient?: RedisClient;
    logger?: Logger;
};

export function createAuthupAggregator(ctx: AuthupAggregatorContext) : Component {
    if (!ctx.redisSubscribeClient || ctx.env === EnvironmentName.TEST) {
        return {
            start() {
                ctx.logger?.warn('Authup aggregator has not been initialized');
            },
        };
    }

    const redisSub = ctx.redisSubscribeClient;
    const { logger } = ctx;

    return {
        start() {
            redisSub.subscribe(
                'permission',
                'policy',
                'realm',
                'user',
                'robot',
            );

            redisSub.on('message', async (channel, message) => {
                logger?.debug(`Received event from channel ${channel}`);
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
                        await handleAuthupRobotEvent(event, ctx?.registryComponentCaller);
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
