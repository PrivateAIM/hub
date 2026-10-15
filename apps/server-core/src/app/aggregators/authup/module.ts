/*
 * Copyright (c) 2023-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { EntityType } from '@authup/core-kit';
import type { Component } from '@privateaim/server-kit';
import { EnvironmentName } from '@privateaim/server-kit';
import {
    handleAuthupRealmEvent,
    handleAuthupRobotEvent,
    handleAuthupUserEvent,
} from './entities/index.ts';
import type { AuthupAggregatorContext } from './types.ts';

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
                'realm',
                'user',
                'client',
            );

            redisSub.on('message', async (channel, message) => {
                logger?.debug(`Received event from channel ${channel}`);
                const event = JSON.parse(message);

                switch (event.type) {
                    case EntityType.REALM: {
                        await handleAuthupRealmEvent(event, ctx);
                        break;
                    }
                    case EntityType.CLIENT: {
                        await handleAuthupRobotEvent(event, ctx, ctx.registryComponentCaller);
                        break;
                    }
                    case EntityType.USER: {
                        await handleAuthupUserEvent(event, ctx);
                        break;
                    }
                }
            });
        },
    };
}
