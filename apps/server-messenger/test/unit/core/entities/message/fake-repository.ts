/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { randomUUID } from 'node:crypto';
import type { Message, MessageParty } from '@privateaim/messenger-kit';
import type { IMessageRepository, MessagePersistInput } from '../../../../../src/core/entities/message/types.ts';

type StoredMessage = Message & { expires_at: string };

export class FakeMessageRepository implements IMessageRepository {
    public messages: StoredMessage[] = [];

    private counter = 0;

    async createMany(input: MessagePersistInput[]): Promise<Message[]> {
        return input.map((item) => {
            this.counter += 1;
            const message: StoredMessage = {
                ...item,
                id: randomUUID(),
                // monotonic ISO timestamp so ordering is deterministic in tests
                created_at: new Date(Date.now() + this.counter).toISOString(),
            };
            this.messages.push(message);
            return message;
        });
    }

    async findManyForRecipient(recipient: MessageParty, limit: number): Promise<Message[]> {
        return this.messages
            .filter((message) => message.recipient_type === recipient.type && message.recipient_id === recipient.id)
            .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))
            .slice(0, limit);
    }

    async ackByIds(recipient: MessageParty, ids: string[]): Promise<void> {
        const set = new Set(ids);
        this.messages = this.messages.filter(
            (message) => !(
                message.recipient_type === recipient.type &&
                message.recipient_id === recipient.id &&
                set.has(message.id)
            ),
        );
    }

    async deleteExpired(now: Date): Promise<number> {
        const before = this.messages.length;
        const cutoff = now.getTime();
        this.messages = this.messages.filter((message) => new Date(message.expires_at).getTime() >= cutoff);
        return before - this.messages.length;
    }
}
