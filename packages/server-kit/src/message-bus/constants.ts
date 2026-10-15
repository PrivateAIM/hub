/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { MessageBus } from './module';

export const MESSAGE_BUS_MODULE_NAME = 'messageBus';

/**
 * Delivery attempts of a WORK message before the AMQP driver drops it.
 * Exported so a handler can tell its last attempt apart (`metadata.attempt`).
 */
export const MESSAGE_BUS_MAX_ATTEMPTS = 5;

export const MessageBusInjectionKey = new TypedToken<MessageBus>('MessageBus');

export enum MessageBusRoutingType {
    WORK = 'work',
    PUB_SUB = 'pubSub',
}
