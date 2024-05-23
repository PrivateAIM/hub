/*
 * Copyright (c) 2022-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Component,
} from '@privateaim/server-kit';
import { isComponentCommandQueuePayload, useAmqpClient, useLogger } from '@privateaim/server-kit';
import { ComponentName } from '@privateaim/server-analysis-manager-kit';
import { executeCoreCommand } from '../../../core';
import {
    executeBuilderCommand,
} from '../../../index';
import { ROUTER_QUEUE_ROUTING_KEY } from './constants';

export function buildComponentRouter() : Component {
    function start() {
        const client = useAmqpClient();
        return client.consume({
            exchange: { routingKey: ROUTER_QUEUE_ROUTING_KEY },
        }, {
            $any: async (message) => {
                const payload = JSON.parse(message.content.toString('utf-8'));
                if (!isComponentCommandQueuePayload(payload)) {
                    useLogger().warn('The queue payload could not be read as component queue payload.');
                }

                useLogger().debug('Command received', {
                    component: payload.metadata.component,
                    command: payload.metadata.command,
                });

                const context = {
                    command: payload.metadata.command,
                    data: payload.data,
                };

                switch (payload.metadata.component) {
                    case ComponentName.BUILDER: {
                        await executeBuilderCommand(context);
                        break;
                    }
                    case ComponentName.CORE: {
                        await executeCoreCommand(context);
                        break;
                    }
                }
            },
        });
    }

    return {
        start,
    };
}
