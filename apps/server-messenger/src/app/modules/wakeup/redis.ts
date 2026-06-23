/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MessageParty } from '@privateaim/messenger-kit';
import type { Client as RedisClient } from 'redis-extension';
import { AbstractMessageWakeup } from '../../../core/services/wakeup/index.ts';
import type { MessageWakeupContext } from '../../../core/services/wakeup/index.ts';
import { MESSAGE_WAKEUP_CHANNEL } from './constants.ts';

export type RedisMessageWakeupContext = MessageWakeupContext & {
    publishClient: RedisClient,
    subscribeClient: RedisClient
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

    constructor(ctx: RedisMessageWakeupContext) {
        super(ctx);
        this.publishClient = ctx.publishClient;
        this.subscribeClient = ctx.subscribeClient;
    }

    async start(): Promise<void> {
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
        await this.publishClient.publish(MESSAGE_WAKEUP_CHANNEL, JSON.stringify({ recipient }));
    }

    async stop(): Promise<void> {
        await this.subscribeClient.unsubscribe(MESSAGE_WAKEUP_CHANNEL).catch(() => undefined);
    }
}
