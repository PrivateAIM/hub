/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { Client, ExchangeType } from 'amqp-extension';
import type { QueueOptions } from 'amqp-extension';
import type { Logger } from '../../logger';
import { MESSAGE_BUS_MAX_ATTEMPTS, MessageBusRoutingType } from '../constants';
import { isMessageBusPayload } from '../helpers';
import type { MessageBusPayload, MessageBusRouting } from '../types';
import type { IMessageBusDriver } from './types';

export type AmqpMessageBusDriverOptions = {
    connectionString: string,
    logger?: Logger,
    /**
     * Delivery attempts of a WORK message before it is dropped
     * (default: MESSAGE_BUS_MAX_ATTEMPTS).
     */
    maxAttempts?: number,
    /**
     * Base of the exponential retry backoff in ms (default: 1000, capped at 30s).
     */
    retryDelay?: number,
};

export type AmqpMessageBusDelivery = {
    content: Buffer,
    fields: { redelivered: boolean },
};

/**
 * Serialize a payload for the wire. An Error's fields are non-enumerable, so
 * plain JSON.stringify would turn it into `{}` and lose the failure reason.
 */
export function serializeMessageBusPayload(payload: MessageBusPayload): string {
    return JSON.stringify(payload, (_key, value: unknown) => {
        if (value instanceof Error) {
            return {
                name: value.name,
                message: value.message,
                ...('code' in value ? { code: value.code } : {}),
            };
        }

        return value;
    });
}

export class AmqpMessageBusDriver implements IMessageBusDriver {
    protected connectionString: string;

    protected clientInstance: Client | undefined;

    protected logger?: Logger;

    protected maxAttempts: number;

    protected retryDelay: number;

    /**
     * WORK messages whose handler is still running in this process, by id.
     */
    protected inFlight = new Map<string, Promise<void>>();

    constructor(options: AmqpMessageBusDriverOptions) {
        this.connectionString = options.connectionString;
        this.logger = options.logger;
        this.maxAttempts = options.maxAttempts ?? MESSAGE_BUS_MAX_ATTEMPTS;
        this.retryDelay = options.retryDelay ?? 1000;
    }

    protected get client(): Client {
        if (!this.clientInstance) {
            this.clientInstance = new Client({ connectionOptions: this.connectionString });
        }

        return this.clientInstance;
    }

    async publish(routing: MessageBusRouting, message: MessageBusPayload): Promise<boolean> {
        const exchange = this.resolveExchange(routing);

        // Resolves once the broker confirmed the message (a rejection throws);
        // amqplib's boolean only reports write-buffer backpressure.
        await exchange.publish(routing.key, serializeMessageBusPayload(message), {
            type: message.type,
            messageId: message.id,
            persistent: message.metadata.persistent ??
                routing.type === MessageBusRoutingType.WORK,
            ...this.resolveQueueOptions(routing),
        });

        return true;
    }

    async consume(
        routing: MessageBusRouting,
        handler: (payload: MessageBusPayload) => Promise<void> | void,
    ): Promise<void> {
        const exchange = this.resolveExchange(routing);

        await exchange.consume(routing.key, {
            // Events are applied one at a time as well: aggregator handlers
            // read-modify-write entities and would otherwise overwrite each other.
            prefetchCount: 1,
            // Only reached when the retry re-publish itself fails (broker
            // unavailable): requeue, so the message comes back as a redelivery.
            requeueOnFailure: routing.type === MessageBusRoutingType.WORK,
            ...this.resolveQueueOptions(routing),
        }, { $any: (input) => this.deliver(routing, input, handler) });
    }

    protected async deliver(
        routing: MessageBusRouting,
        input: AmqpMessageBusDelivery,
        handler: (payload: MessageBusPayload) => Promise<void> | void,
    ): Promise<void> {
        let payload: unknown;

        try {
            payload = JSON.parse(input.content.toString('utf-8'));
        } catch {
            this.logger?.warn(`Could not parse message in ${routing.key}.`);

            return;
        }

        if (!isMessageBusPayload(payload)) {
            this.logger?.warn(`Dropping malformed message in ${routing.key}.`);

            return;
        }

        if (routing.type !== MessageBusRoutingType.WORK) {
            await handler(payload);

            return;
        }

        if (input.fields.redelivered) {
            // The channel was reset (reconnect) while this process is still
            // handling the message: the original run is alive, so drop the copy.
            const running = this.inFlight.get(payload.id);
            if (running) {
                this.logger?.debug(`Message ${payload.type} (${payload.id}) in ${routing.key} is still being handled.`);

                // Acking the copy would free the prefetch slot and let the next
                // message of an ordered stream run next to the original.
                if (routing.ordered) {
                    await running.catch(() => undefined);
                }

                return;
            }

            // Otherwise the consumer died mid-handling (crash, consumer
            // timeout), so the redelivery counts as a failed attempt. Held in
            // flight through the backoff, so a reset during it is not retried twice.
            // ponytail: a reset between the retry publish and the ack still
            // duplicates the command; at-least-once until a claim exists (F9/F10).
            await this.track(payload.id, this.retry(routing, payload));

            return;
        }

        await this.track(payload.id, (async () => {
            try {
                await handler(payload);
            } catch {
                await this.retry(routing, payload);
            }
        })());
    }

    protected async track(id: string, run: Promise<void>): Promise<void> {
        this.inFlight.set(id, run);

        try {
            await run;
        } finally {
            this.inFlight.delete(id);
        }
    }

    /**
     * Re-publish a WORK message with an incremented attempt counter, or drop it
     * once the attempts are exhausted. The original is acked afterwards.
     *
     * ponytail: exhausted messages are logged and dropped, not parked;
     * add a dead-letter queue once someone needs to replay them.
     */
    protected async retry(routing: MessageBusRouting, payload: MessageBusPayload): Promise<void> {
        const attempt = (payload.metadata.attempt ?? 1) + 1;
        if (attempt > this.maxAttempts) {
            this.logger?.error(
                `Dropping message ${payload.type} (${payload.id}) in ${routing.key} after ${this.maxAttempts} attempts.`,
            );

            return;
        }

        // ponytail: the backoff holds the prefetch slot, fine for seconds;
        // move to TTL + dead-letter-exchange delay queues for longer delays.
        const delay = Math.min(this.retryDelay * 2 ** (attempt - 2), 30_000);
        await new Promise((resolve) => {
            setTimeout(resolve, delay);
        });

        this.logger?.warn(`Retrying message ${payload.type} (${payload.id}) in ${routing.key}, attempt ${attempt}.`);

        await this.publish(routing, {
            ...payload,
            metadata: {
                ...payload.metadata,
                attempt,
            },
        });
    }

    /**
     * Publisher and consumer must declare the queue identically (the broker
     * answers a mismatch with 406), so both sides derive it from the routing.
     */
    protected resolveQueueOptions(routing: MessageBusRouting): QueueOptions {
        return routing.ordered ? { singleActiveConsumer: true } : {};
    }

    private resolveExchange(routing: MessageBusRouting): Client {
        if (routing.type === MessageBusRoutingType.WORK) {
            return this.client.of({
                type: ExchangeType.DIRECT,
                name: routing.namespace || '',
            });
        }

        return this.client.of({
            type: ExchangeType.TOPIC,
            name: routing.namespace || 'FLAME',
        });
    }
}
