/*
 * Copyright (c) 2024-2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { TypedToken } from 'eldin';
import type { IMessageBus } from 'hubwire';

export const MESSAGE_BUS_MODULE_NAME = 'messageBus';

/**
 * Delivery attempts of a WORK message before the AMQP driver drops it.
 * A handler reads it back as `metadata.delivery.maxAttempts`.
 */
export const MESSAGE_BUS_MAX_ATTEMPTS = 5;

export const MessageBusInjectionKey = new TypedToken<IMessageBus>('MessageBus');

/**
 * The same bus, registered only when its driver reaches other services (AMQP),
 * never for the in-process memory driver. A publisher whose only consumer is
 * another service (logs and entity events for server-telemetry, storage events
 * for server-core) resolves this one: the memory driver keeps a WORK message
 * until a consumer takes it, so such a publish would grow the heap until close().
 */
export const RemoteMessageBusInjectionKey = new TypedToken<IMessageBus>('RemoteMessageBus');

/**
 * Topic exchange of PUB_SUB routings without a namespace. Part of the wire
 * contract: a different name is a different exchange.
 */
export const MESSAGE_BUS_TOPIC_EXCHANGE = 'FLAME';
