/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ConsumeMessage } from 'amqp-extension';
import { consume } from 'amqp-extension';
import { useLogger } from '../../config';
import { ComponentName } from '../constants';
import { executeSecretStorageComponentCommand } from '../secret-storage';
import { executeRegistryCommand } from '../registry';
import { executeStationRegistryCommand } from '../station-registry';
import { executeTrainCommand } from '../train';
import { ROUTER_QUEUE_ROUTING_KEY } from './constants';
import type { RouterQueuePayload } from './type';

export function buildRouterComponent() {
    function start() {
        return consume({ exchange: { routingKey: ROUTER_QUEUE_ROUTING_KEY } }, {
            $any: async (message: ConsumeMessage) => {
                const messageContent : RouterQueuePayload<any> = JSON.parse(message.content.toString('utf-8'));

                useLogger().debug('Command received', {
                    component: messageContent.metadata.component,
                    command: messageContent.metadata.command,
                    ...(messageContent.metadata.event ? { event: messageContent.metadata.event } : {}),
                });

                switch (messageContent.metadata.component) {
                    case ComponentName.REGISTRY: {
                        await executeRegistryCommand(
                            messageContent.metadata.command,
                            messageContent.data,
                            messageContent.metadata.event,
                        );
                        break;
                    }
                    case ComponentName.SECRET_STORAGE: {
                        await executeSecretStorageComponentCommand(
                            messageContent.metadata.command,
                            messageContent.data,
                        );
                        break;
                    }
                    case ComponentName.STATION_REGISTRY: {
                        await executeStationRegistryCommand(
                            messageContent.metadata.command,
                            messageContent.data,
                        );
                        break;
                    }
                    case ComponentName.TRAIN: {
                        await executeTrainCommand(
                            messageContent.metadata.command,
                            messageContent.data,
                        );
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
