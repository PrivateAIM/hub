/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { AmqpMessageBusDriverHooks } from '@synergos/amqp';
import type {
    DispatchCallerHooks,
    MessageBusHooks,
    MessageRouting,
    ScheduledComponentHooks,
    WorkerCallerHooks,
} from 'synergos';
import type { Logger } from '../logger';
import type { MessageBusLogHooksOptions } from './types';

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

function isSameRouting(a: MessageRouting, b: MessageRouting): boolean {
    return a.type === b.type &&
        a.key === b.key &&
        (a.namespace || '') === (b.namespace || '');
}

/**
 * Logs what the bus publishes and consumes. A publish to a silent routing is not
 * logged: those carry the log lines (and audit events) themselves, so logging
 * their publish would feed the logger's own transport back into the bus.
 */
export function createMessageBusLogHooks(
    logger: Logger,
    options: MessageBusLogHooksOptions = {},
): MessageBusHooks {
    const silentRoutings = options.silentRoutings || [];

    return {
        onPublish(message) {
            const { routing } = message.metadata;
            if (silentRoutings.some((silent) => isSameRouting(silent, routing))) {
                return;
            }

            logger.debug(`Publishing queue message ${message.type} in ${routing.key}`, { messageId: message.id });
        },
        onConsume(message, routing) {
            logger.debug(`Consuming queue message ${message.type} in ${routing.key}`, { messageId: message.id });
        },
        onUnhandled(message, routing) {
            logger.debug(`No queue handler to consume message ${message.type} in ${routing.key}`, { messageId: message.id });
        },
        onError(error, message, routing) {
            logger.error(
                `Handling queue message ${message.type} in ${routing.key} failed: ${toErrorMessage(error)}`,
                { messageId: message.id },
            );
        },
    };
}

export function createAmqpDriverLogHooks(logger: Logger): AmqpMessageBusDriverHooks {
    return {
        onRetry({
            message, 
            routing, 
            attempt, 
        }) {
            logger.warn(`Retrying message ${message.type} in ${routing.key}.`, { messageId: message.id, attempt });
        },
        onDrop({
            message, 
            routing, 
            attempt, 
        }) {
            logger.error(
                `Dropping message ${message.type} in ${routing.key} after ${attempt} attempts.`,
                { messageId: message.id, attempt },
            );
        },
        onMalformed({ routing, error }) {
            if (error) {
                logger.warn(`Could not parse message in ${routing.key}.`);
                return;
            }

            logger.warn(`Dropping malformed message in ${routing.key}.`);
        },
    };
}

export function createDispatchCallerLogHooks(logger: Logger): DispatchCallerHooks {
    return {
        onUndelivered(message) {
            logger.warn(
                `Message ${message.type} in ${message.metadata.routing.key} was not delivered to any consumer.`,
                { messageId: message.id },
            );
        },
    };
}

export function createWorkerCallerLogHooks(logger: Logger): WorkerCallerHooks {
    return {
        onUnrouted(key) {
            logger.warn(`Event ${key} could not be handled: no routing to publish it to.`);
        },
    };
}

export function createScheduledComponentLogHooks(logger: Logger, name: string): ScheduledComponentHooks {
    return {
        onError(error) {
            logger.warn(`Component ${name} pass failed: ${toErrorMessage(error)}`);
        },
    };
}
