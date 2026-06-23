/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MessageParty } from '@privateaim/messenger-kit';
import type { Logger } from '@privateaim/server-kit';
import type { Client as RedisClient } from 'redis-extension';
import { AbstractMessageWakeup } from '../../../core/services/wakeup/index.ts';
import type { MessageWakeupContext } from '../../../core/services/wakeup/index.ts';
import { MESSAGE_WAKEUP_CHANNEL } from './constants.ts';

export type RedisMessageWakeupContext = MessageWakeupContext & {
    publishClient: RedisClient,
    subscribeClient: RedisClient,
    logger?: Logger
};

/**
 * Cross-instance wakeup over redis pub/sub. `notify` publishes a payload-free
 * `{ recipient }` to every instance; each instance resolves its own parked
 * long-polls and emits the socket wakeup to its locally-connected recipient.
 * The subscribe client must be dedicated (a connection in subscribe mode cannot
 * also serve the socket.io adapter).
 */
export class RedisMessageWakeup extends AbstractMessageWakeup {
    protected publishClient: RedisClient;

    protected subscribeClient: RedisClient;

    protected logger: Logger | undefined;

    constructor(ctx: RedisMessageWakeupContext) {
        super(ctx);
        this.publishClient = ctx.publishClient;
        this.subscribeClient = ctx.subscribeClient;
        this.logger = ctx.logger;
    }

    async start(): Promise<void> {
        // surface errors on the dedicated subscribe connection instead of crashing on an unhandled event
        this.subscribeClient.on('error', (error: Error) => {
            this.logger?.warn(`Message wakeup subscribe connection error: ${error.message}`);
        });

        await this.subscribeClient.subscribe(MESSAGE_WAKEUP_CHANNEL);
        this.subscribeClient.on('message', (channel: string, payload: string) => {
            if (channel !== MESSAGE_WAKEUP_CHANNEL) {
                return;
            }

            try {
                const parsed = JSON.parse(payload) as { recipient?: MessageParty };
                if (parsed.recipient) {
                    this.dispatch(parsed.recipient);
                }
            } catch {
                // ignore malformed wakeup payloads
            }
        });
    }

    async notify(recipient: MessageParty): Promise<void> {
        // best-effort: never throw — the caller's send is already durable
        try {
            await this.publishClient.publish(MESSAGE_WAKEUP_CHANNEL, JSON.stringify({ recipient }));
        } catch (error) {
            this.logger?.warn(`Message wakeup publish failed: ${(error as Error).message}`);
        }
    }

    async stop(): Promise<void> {
        try {
            await this.subscribeClient.unsubscribe(MESSAGE_WAKEUP_CHANNEL);
        } catch {
            // ignore
        }

        // close the dedicated subscribe connection (only unsubscribing leaves the socket open)
        try {
            await this.subscribeClient.quit();
        } catch {
            this.subscribeClient.disconnect();
        }
    }
}
