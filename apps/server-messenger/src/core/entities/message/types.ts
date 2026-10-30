/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Message,
    MessageAckRequest,
    MessageParty,
    MessagePullQuery,
    MessagePullResponse,
    SendMessageRequest,
} from '@privateaim/messenger-kit';
import type { ActorContext } from '@privateaim/server-kit';

/**
 * The writable fields of a message — `id` and `createdAt` are generated.
 * `expiresAt` is an absolute expiry timestamp (ISO-8601), set from the TTL at send time.
 */
export type MessagePersistInput = Omit<Message, 'id' | 'createdAt'> & {
    expiresAt: string;
};

export interface IMessageRepository {
    /** Persist one row per recipient and return the stored messages. */
    createMany(input: MessagePersistInput[]): Promise<Message[]>;

    /**
     * Pending messages addressed to `recipient` (type + id) that have not
     * expired at `now`, oldest first, up to `limit`. Expiry is checked here as
     * well as by the sweep, which only runs periodically.
     */
    findManyForRecipient(recipient: MessageParty, limit: number, now: Date): Promise<Message[]>;

    /** Delete the named messages for `recipient` (type + id) — delete-on-ack. */
    ackByIds(recipient: MessageParty, ids: string[]): Promise<void>;

    /**
     * Delete messages whose absolute expiry (`expiresAt`) is before `now` (TTL
     * sweep); returns the count removed. Removal is batched (see
     * MESSAGE_SWEEP_BATCH_SIZE).
     */
    deleteExpired(now: Date, options?: { batchSize?: number }): Promise<number>;
}

export interface IMessageService {
    send(data: SendMessageRequest, actor: ActorContext): Promise<Message[]>;
    pull(query: MessagePullQuery, actor: ActorContext): Promise<MessagePullResponse>;
    ack(data: MessageAckRequest, actor: ActorContext): Promise<void>;
}
