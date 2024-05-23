/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    ComponentError, isComponentEventQueuePayload, useAmqpClient, useLogger,
} from '@privateaim/server-kit';
import { ComponentName } from '@privateaim/server-analysis-manager-kit';
import type { Aggregator } from '../type';
import { handleTrainManagerBuilderEvent } from './builder';

export function buildTrainManagerAggregator() : Aggregator {
    const client = useAmqpClient();
    return {
        start: () => client.consume({
            exchange: {
                routingKey: 'api.aggregator.tm',
            },
        }, {
            $any: async (message) => {
                const payload = JSON.parse(message.content.toString('utf-8'));
                if (!isComponentEventQueuePayload(payload)) {
                    useLogger().error('Train-Manager aggregation event could not be processed.');
                    return;
                }

                let error : ComponentError | undefined;

                if (payload.error) {
                    error = new ComponentError({
                        component: payload.metadata.component,
                        message: payload.error.message,
                        code: payload.error.code,
                        step: `${payload.error.step}`,
                    });
                }

                useLogger().debug('Event received', {
                    component: payload.metadata.component,
                    command: payload.metadata.command,
                    event: payload.metadata.event,
                });

                switch (payload.metadata.component) {
                    case ComponentName.BUILDER: {
                        await handleTrainManagerBuilderEvent({
                            command: payload.metadata.command as any,
                            event: payload.metadata.event as any,
                            data: payload.data as any,
                            ...(error ? { error } : {}),
                        });
                        break;
                    }
                }
            },
        }),
    };
}
