/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useAmqpClient, useLogger } from '../../services';
import { isComponentCommandQueuePayload } from '../component';
import type { Component } from '../component';
import type { QueueRouterCreateContext } from './types';

export function createQueueRouterComponent(ctx: QueueRouterCreateContext) : Component {
    function start() {
        // todo: check if amqp client is usable ?
        const client = useAmqpClient();

        return client.consume({
            exchange: {
                routingKey: ctx.routingKey,
            },
            prefetchCount: 1,
            noAck: false,
        }, {
            $any: async (message) => {
                const payload = JSON.parse(message.content.toString('utf-8'));
                if (!isComponentCommandQueuePayload(payload)) {
                    useLogger().error('The queue router payload is malformed.');
                    return;
                }

                useLogger().debug('Command received', {
                    component: payload.metadata.component,
                    command: payload.metadata.command,
                });

                const handler = ctx.handlers[payload.metadata.component];
                if (typeof handler !== 'function') {
                    useLogger().error(`No handler registered for component ${payload.metadata.component}`);
                }

                await handler({
                    command: payload.metadata.command,
                    data: payload.data,
                });
            },
        });
    }

    return {
        start,
    };
}
