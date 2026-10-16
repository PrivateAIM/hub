/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { IMessageBus } from 'synergos';

export const MESSAGE_BUS_MODULE_NAME = 'messageBus';

/**
 * Delivery attempts of a WORK message before the AMQP driver drops it.
 * Exported so a handler can tell its last attempt apart (`metadata.attempt`).
 */
export const MESSAGE_BUS_MAX_ATTEMPTS = 5;

export const MessageBusInjectionKey = new TypedToken<IMessageBus>('MessageBus');

/**
 * Topic exchange of PUB_SUB routings without a namespace. Part of the wire
 * contract: a different name is a different exchange.
 */
export const MESSAGE_BUS_TOPIC_EXCHANGE = 'FLAME';
