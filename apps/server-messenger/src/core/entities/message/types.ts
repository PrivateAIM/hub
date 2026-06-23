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
 * The writable fields of a message — `id` and `created_at` are generated.
 * `expires_at` is an absolute epoch (ms), set by the sender (TTL).
 */
export type MessagePersistInput = Omit<Message, 'id' | 'created_at'> & {
    expires_at: string;
};

export interface IMessageRepository {
    /** Persist one row per recipient and return the stored messages. */
    createMany(input: MessagePersistInput[]): Promise<Message[]>;

    /** Pending messages addressed to `recipient` (type + id), oldest first, up to `limit`. */
    findManyForRecipient(recipient: MessageParty, limit: number): Promise<Message[]>;

    /** Delete the named messages for `recipient` (type + id) — delete-on-ack. */
    ackByIds(recipient: MessageParty, ids: string[]): Promise<void>;

    /** Delete messages whose absolute expiry (`expires_at`) is before `now` (TTL sweep); returns the count removed. */
    deleteExpired(now: Date): Promise<number>;
}

export interface IMessageService {
    send(data: SendMessageRequest, actor: ActorContext): Promise<Message[]>;
    pull(query: MessagePullQuery, actor: ActorContext): Promise<MessagePullResponse>;
    ack(data: MessageAckRequest, actor: ActorContext): Promise<void>;
}
