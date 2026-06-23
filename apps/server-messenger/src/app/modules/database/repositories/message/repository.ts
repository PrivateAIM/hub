/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Message, MessageParty } from '@privateaim/messenger-kit';
import type { DataSource, Repository } from 'typeorm';
import { MessageEntity } from '../../../../../adapters/database/entities/message.ts';
import type { IMessageRepository, MessagePersistInput } from '../../../../../core/entities/message/types.ts';

export class MessageRepositoryAdapter implements IMessageRepository {
    protected repository: Repository<MessageEntity>;

    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(MessageEntity);
    }

    async createMany(input: MessagePersistInput[]): Promise<Message[]> {
        const entities = input.map((item) => this.repository.create(item));

        return this.repository.save(entities);
    }

    async findManyForRecipient(recipient: MessageParty, limit: number): Promise<Message[]> {
        // select only the public Message fields — `expires_at` is internal (TTL)
        return this.repository.createQueryBuilder('message')
            .select([
                'message.id',
                'message.sender_type',
                'message.sender_id',
                'message.recipient_type',
                'message.recipient_id',
                'message.data',
                'message.metadata',
                'message.created_at',
            ])
            .where('message.recipient_type = :recipientType', { recipientType: recipient.type })
            .andWhere('message.recipient_id = :recipientId', { recipientId: recipient.id })
            .orderBy('message.created_at', 'ASC')
            .addOrderBy('message.id', 'ASC')
            .limit(limit)
            .getMany();
    }

    async ackByIds(recipient: MessageParty, ids: string[]): Promise<void> {
        if (ids.length === 0) {
            return;
        }

        await this.repository.createQueryBuilder()
            .delete()
            .from(MessageEntity)
            .where('recipient_type = :recipientType', { recipientType: recipient.type })
            .andWhere('recipient_id = :recipientId', { recipientId: recipient.id })
            .andWhere('id IN (:...ids)', { ids })
            .execute();
    }

    async deleteExpired(now: Date): Promise<number> {
        const result = await this.repository.createQueryBuilder()
            .delete()
            .from(MessageEntity)
            .where('expires_at < :now', { now })
            .execute();

        return result.affected ?? 0;
    }
}
